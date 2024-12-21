import { OPCodes, ConnectionState, HELLO_TIMEOUT, HEARTBEAT_MAX_RESUME_THRESHOLD, MAX_CONNECTION_RETRIES } from '~/discord/constants';
import type { Guild, Message, StoreItem, StoreItemAttachment, User } from '@types';
import { getDiscordListeners, getDiscordReplacements } from '~/config';
import { getDiscordEntityDetails } from '~/utils/get-entity-details';
import { createLogger } from '~/structures/logger';
import { stripToken } from '~/utils/strip';
import { cacheItem } from '~/file-cache';
import { fetchBuffer } from '~/utils';
import config from '@config.json';
import storage from '~/storage';
import { hash } from '~/utils';
import WebSocket from 'ws';


class Client {
	logger = createLogger('Discord', 'Boot');
	channels: Map<string, any> = new Map();
	guilds: Map<string, Guild> = new Map();
	ws: WebSocket | null = null;

	user: User | null = null;

	helloTimeout: NodeJS.Timer | null = null;
	heartbeatHandler: NodeJS.Timer | null = null;

	pendingRestart: boolean = false;
	connectionStartTime: number | null = null;
	lastHeartbeatAckTime: number | null = null;
	heartbeatInterval: number | null = null;
	state: ConnectionState = ConnectionState.DISCONNECTED;
	attempts: number = 0;
	sessionId: string | null = null;
	sequence: number = 0;

	constructor(
		public token: string,
		public accountIndex: number
	) { }

	onMessage(data: string) {
		try {
			const payload = JSON.parse(data);

			if (payload.s) {
				this.sequence = payload.s;
			}

			switch (payload.op) {
				case OPCodes.HELLO: {
					this.clearHelloTimeout();
					this.onHello(payload.d);
				} break;

				case OPCodes.HEARTBEAT_ACK: {
					// this.logger.debug('⟶ PONG');
					this.lastHeartbeatAckTime = Date.now();
				} break;

				case OPCodes.INVALID_SESSION: {
					if (payload.d) {
						this.resume();
					} else {
						this.identify();
					}
				} break;

				case OPCodes.RECONNECT: {
					this.reconnect();
				} break;

				case OPCodes.DISPATCH: {
					this.onDispatch(payload);
				} break;
			}
		} catch (e) {
			this.logger.error('Failed to handle message:', e);
		}
	}

	onOpen() {
		this.logger.debug('Socket opened.');
		this.state = ConnectionState.CONNECTED;
		const now = Date.now();

		if (this.canResume) {
			this.resume();
		} else {
			this.identify();
		}

		this.lastHeartbeatAckTime = now;
	}

	async onClose(code: number, reason: Buffer) {
		this.logger.warn(stripToken(this.token) + ' Closed with code:', code, reason.toString('utf8'));
		this.state = ConnectionState.DISCONNECTED;
		this.stopHeartbeat();

		if (code === 4004) {
			this.logger.error(`Invalid token: ${stripToken(this.token)}`);
			return;
		}

		if (code === 4444) return;
		if (this.shouldAttempt) {
			if ((this.attempts * 1000) !== 0) {
				this.logger.warn(`Waiting ${this.attempts * 1000}ms to reconnect...`);
			}

			setTimeout(() => {
				if (!this.shouldAttempt) return;
				this.logger.info(`Attempting to reconnect (attempt ${this.attempts}): ${stripToken(this.token)}`);
				this.start();
			}, this.attempts * 1000);
		} else {
			this.logger.error(`Connected timed out ${this.attempts}, bye.`);
		}
	}

	onError(error: Error) {
		this.logger.error('Encountered error:', error);
	}

	async onDispatch(payload: any) {
		switch (payload.t) {
			case 'READY': {
				this.sessionId = payload.d.session_id;
				this.user = payload.d.user;

				for (const channel of payload.d.private_channels ?? []) {
					this.channels.set(channel.id, channel);
				};

				for (const guild of payload.d.guilds ?? []) {
					this.guilds.set(guild.id, guild);

					for (const channel of guild.channels) {
						this.channels.set(channel.id, channel);
					}
				};

				this.logger = createLogger('Discord', this.user!.username);
				this.state = ConnectionState.CONNECTED;
				this.logger.success(`Logged in.`);
				this.attempts = 0;
			} break;

			case 'RESUMED': {
				this.state = ConnectionState.CONNECTED;
				this.logger.success(`Logged in by resuming old session.`);
				this.attempts = 0;
			} break;

			case 'CHANNEL_UPDATE': {
				const channel = payload.d;
				if (!channel?.id) return;

				this.channels.set(channel.id, channel);
			} break;

			case 'GUILD_UPDATE': {
				const guild = payload.d;
				if (!guild?.id) return;

				this.guilds.set(guild.id, guild);
			} break;

			case 'MESSAGE_CREATE':
			case 'MESSAGE_UPDATE': {
				const msg = payload.d as Message;

				if (!msg.content && !msg.embeds?.length && !msg.attachments?.length) return;

				const matchedListeners = getDiscordListeners().filter(listener => {
					if (listener.chatId && msg.channel_id !== listener.chatId) {
						return false;
					}

					if (!listener.allowBots && msg.author.bot) {
						return false;
					}

					if (listener.users?.length && !listener.users.includes(msg.author?.id)) {
						return false;
					}

					return true;
				}) ?? [];

				if (!matchedListeners?.length) return;

				// const reply = msg.message_reference && (await getMessage({
				// 	channel: msg.message_reference.channel_id,
				// 	message: msg.message_reference.message_id,
				// 	token: this.token
				// }));

				const channel = this.channels.get(msg.channel_id);
				const guild = this.guilds.get(msg.guild_id);
				const content = this.getContent(msg);

				const avatarBuffer: ArrayBuffer | null = await fetchBuffer(msg.author.avatar ?
					`https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.${msg.author.avatar.startsWith('a_') ? 'gif' : 'png'}?size=1024` :
					'https://cdn.discordapp.com/embed/avatars/0.png'
				).catch(() => null);

				const authorAvatar = avatarBuffer ? hash(avatarBuffer) : null;
				if (authorAvatar) cacheItem(authorAvatar, avatarBuffer);

				const originAvatarHash = msg.guild_id ? guild?.icon : channel.icon;

				const originAvatarBuffer = originAvatarHash ? await fetchBuffer(
					`https://cdn.discordapp.com/${channel.icon ? 'channel-icons' : 'icons'}/${channel.icon ? msg.channel_id : msg.guild_id}/${originAvatarHash}.${originAvatarHash.startsWith('a_') ? 'gif' : 'png'}?size=240`
				).catch(() => null) : null;

				const originAvatar = originAvatarHash ? hash(originAvatarBuffer) : authorAvatar;
				if (originAvatar) cacheItem(originAvatar, originAvatarBuffer);

				const attachments: StoreItemAttachment[] = [];
				for (const attachment of msg.attachments ?? []) {
					const buffer: ArrayBuffer | null = await fetchBuffer(attachment.url).catch(() => null);
					if (!buffer) continue;

					const uuid = hash(buffer);

					cacheItem(uuid, buffer);

					attachments.push({
						name: attachment.filename,
						type: attachment.content_type,
						identifier: uuid
					});
				}

				const item: StoreItem<'discord'> = {
					savedAt: Date.now(),
					type: 'discord',
					listeners: [...new Set(matchedListeners.map(l => l.name))],
					groups: [...new Set(matchedListeners.map(l => l.group))],
					author: msg.author.username,
					origin: await getDiscordEntityDetails(msg, guild, channel),
					originAvatar,
					authorAvatar,
					content,
					attachments,
					parameters: {
						messageId: msg.id,
						channelId: channel.id,
						guildId: guild?.id,
						accountIndex: this.accountIndex
					}
				};

				storage.add(item);
			} break;
		}
	}

	getContent(msg: Message) {
		let content = msg.content;

		if (getDiscordReplacements()) {
			for (const [subject, replacement] of Object.entries(getDiscordReplacements())) {
				content = content?.replaceAll(subject, replacement);
			}
		}

		return content;
	}

	onHello(payload: { heartbeat_interval: number; }) {
		this.logger.debug('Received HELLO.');
		this.heartbeatInterval = payload.heartbeat_interval;
		this.startHeartbeat();
	}

	clearHelloTimeout() {
		if (!this.helloTimeout) return;

		clearTimeout(this.helloTimeout);
		this.helloTimeout = null;
	}

	start() {
		const states = [ConnectionState.CONNECTED, ConnectionState.CONNECTING];
		if (~states.indexOf(this.state)) return;
		if (this.ws?.readyState === WebSocket.OPEN) this.ws.close(1000);


		this.attempts++;
		this.connectionStartTime = Date.now();

		this.helloTimeout = setTimeout(() => {
			const delay = Date.now() - this.connectionStartTime!;
			if (this.ws) this.ws!.close(1000, `The connection timed out after ${delay}ms.`);
		}, HELLO_TIMEOUT);

		this.ws = new WebSocket(`wss://gateway.discord.gg/?v=${config.discord.wsVersion}&encoding=json`);

		this.ws.on('message', this.onMessage.bind(this));
		this.ws.on('close', this.onClose.bind(this));
		this.ws.on('error', this.onError.bind(this));
		this.ws.on('open', this.onOpen.bind(this));
	}

	identify() {
		this.logger.debug('Sending IDENTIFY.');

		this.sequence = 0;
		this.sessionId = null;
		this.state = ConnectionState.IDENTIFYING;

		this.broadcast(OPCodes.IDENTIFY, {
			token: this.token,
			properties: config.discord.superProperties
		});
	}

	resume() {
		this.logger.info('Attempting to resume old session...');
		this.state = ConnectionState.RESUMING;

		this.broadcast(OPCodes.RESUME, {
			token: this.token,
			session_id: this.sessionId,
			seq: this.sequence
		});
	}

	destroy(code: number = 1000) {
		if (this.ws) {
			this.ws.close(code);
			this.ws = null;
		}

		this.sessionId = null;
	}

	reconnect() {
		this.logger.info('Reconnecting socket...');
		this.destroy(4444);

		this.state = ConnectionState.DISCOVERING;
		this.start();
	}

	async heartbeat() {
		if (this.state === ConnectionState.CONNECTING) return;

		this.broadcast(OPCodes.HEARTBEAT, this.sequence ?? 0);
		// this.logger.debug('⟵ PING');
	}

	startHeartbeat() {
		this.logger.debug('Starting heartbeat.');
		if (this.heartbeatHandler) this.stopHeartbeat();

		this.heartbeatHandler = setInterval(this.heartbeat.bind(this), this.heartbeatInterval!);
	}

	stopHeartbeat() {
		if (this.heartbeatHandler) clearInterval(this.heartbeatHandler);
		this.heartbeatHandler = null;
	}

	broadcast(op: OPCodes, data: any = {}) {
		if (this.ws?.readyState !== WebSocket.OPEN) return;

		try {
			const stringified = JSON.stringify({ op, d: data });
			this.ws.send(stringified);
		} catch (error) {
			this.logger.error('Failed to send payload:', { data, error });
		}
	}

	get shouldAttempt() {
		const states = [ConnectionState.CONNECTED, ConnectionState.CONNECTING];

		if (~states.indexOf(this.state) || this.attempts === MAX_CONNECTION_RETRIES) {
			return false;
		}

		return true;
	}

	get canResume() {
		const threshold = (!this.lastHeartbeatAckTime || Date.now() - this.lastHeartbeatAckTime <= HEARTBEAT_MAX_RESUME_THRESHOLD);
		return this.sessionId != null && threshold;
	}
}

export default Client;