import { channelPredicate, chatPredicate, dmPredicate } from '~/telegram/predicates';
import type { TelegramClientParams } from 'telegram/client/telegramBaseClient';
import type { StoreItem, StoreItemAttachment, TelegramListener } from '@types';
import { NewMessage, type NewMessageEvent } from 'telegram/events';
import { TelegramClient } from 'telegram/client/TelegramClient';
import { LogLevel } from 'telegram/extensions/Logger';
import { stripPhoneNumber } from '~/utilities/strip';
import { Logger } from 'telegram/extensions/Logger';
import { createLogger } from '~/structures/logger';
import { getTelegramListeners } from '~/config';
import { createItemPath } from '~/file-cache';
import { input } from '@inquirer/prompts';
import { writeFileSync } from 'node:fs';
import mimeTypes from 'mime-types';
import Storage from '~/storage';
import { Api } from 'telegram';


interface ClientOptions {
	phoneNumber: string;
	apiId: number;
	apiHash: string;
	params?: TelegramClientParams;
}

class Client extends TelegramClient {
	private _logger!: ReturnType<typeof createLogger>;

	constructor(options: ClientOptions) {
		// Use a pre-constructor trick to set _logger before super()
		const proto = new.target.prototype;

		Object.defineProperty(proto, '_logger', {
			value: createLogger('Telegram', stripPhoneNumber(options.phoneNumber)),
			writable: true,
			configurable: true
		});

		const cache = `.credentials[${options.phoneNumber.replace(/[^a-zA-Z0-9]/g, '_')}]`;

		super(cache, options.apiId, options.apiHash, options.params ?? { connectionRetries: Infinity });

		this.onMessage = this.onMessage.bind(this);
	}

	async initialize(phoneNumber: string): Promise<void> {
		this._logger = createLogger('Telegram', stripPhoneNumber(phoneNumber));

		await this.start({
			phoneNumber,
			password: async () => input({ message: 'Please enter your password: ' }),
			phoneCode: async () => input({ message: 'Please enter the code you received: ' }),
			onError: (e) => this._log.error('Failed to log in: ' + e.message),
		});

		this.addEventHandler(this.onMessage.bind(this), new NewMessage());
	}

	async onMessage(event: NewMessageEvent) {
		await event.getInputChat();

		const origin = await event.getChat() as Api.Chat | Api.Channel | Api.PeerUser;
		if (!origin) return;

		const author = await event.message.getSender();
		if (!author || author.className !== 'User') return;

		const listeners = getTelegramListeners();
		const matchedListeners: TelegramListener[] = [];

		switch (origin.className) {
			case 'Channel': {
				const reply = await event.message.getReplyMessage();

				const filtered = listeners.filter((listener) => channelPredicate(listener, event, author, origin, reply));
				if (filtered.length) matchedListeners.push(...filtered);
			} break;

			case 'Chat': {
				const filtered = listeners.filter((listener) => chatPredicate(listener, event, author, origin));
				if (filtered.length) matchedListeners.push(...filtered);
			} break;

			case 'PeerUser': {
				const filtered = listeners.filter((listener) => dmPredicate(listener, event, author, origin));
				if (filtered.length) matchedListeners.push(...filtered);
			} break;
		}

		if (!matchedListeners.length) return;

		const photo = await this.downloadProfilePhoto(author);
		const originId = await this.getPeerId(origin);

		const attachments: StoreItemAttachment[] = [];

		const files = await this.getFiles(event.message);
		for (const file of files) {
			const uuid = crypto.randomUUID();
			const cacheItem = createItemPath(uuid);

			writeFileSync(cacheItem, new Uint8Array(file.buffer));

			attachments.push({
				name: file.name,
				type: file.mimeType,
				identifier: uuid
			});
		}

		const item: StoreItem<'telegram'> = {
			type: 'telegram',
			author: author.username,
			authorAvatar: photo?.toString('base64'),
			attachments,
			groups: matchedListeners.map(l => l.name),
			content: event.message.rawText,
			parameters: {
				messageId: event.message.id.toString(),
				originId
			},
			savedAt: Date.now(),
		};

		Storage.add(item);
	}

	async getFiles(message: Api.Message) {
		const files: {
			name: string,
			buffer: Buffer,
			mimeType: string;
		}[] = [];

		const media = message.media;
		const document = message.document;

		if (media?.className === 'MessageMediaWebPage') {
			return files;
		}

		if (document || media) {
			const payload = (document || media) as any;
			if (!payload) return files;

			const buf = await message.downloadMedia() as Buffer;
			if (!buf?.length) return files;

			const id = crypto.randomUUID();
			const attrib = payload.attributes?.find(a => a.fileName)?.fileName;
			const ext = payload.mimeType ? payload.mimeType === 'audio/ogg' ? 'ogg' : mimeTypes.extension(payload.mimeType) : 'png';
			const file = `${id}.${ext}`;

			files.push({
				name: attrib ?? file,
				buffer: buf,
				mimeType: payload.mimeType || 'image/png'
			});
		}

		return files;
	}

	// @ts-ignore
	set _log(value: any) { }
	get _log(): Logger {
		return this._getLogger();
	}

	private _getLogger() {
		const logger = {
			levels: ['error', 'warn', 'info', 'debug'],
			canSend: (level: LogLevel): boolean => {
				return logger.logLevel ? logger.levels.indexOf(logger.logLevel) >= logger.levels.indexOf(level) : false;
			},

			warn: (message: string): void => {
				if (!logger.canSend(LogLevel.WARN)) return;

				this._logger.warn(message);
			},

			info: (message: string): void => {
				if (!logger.canSend(LogLevel.INFO)) return;

				this._logger.info(message);
			},

			debug: (message: string): void => {
				if (!logger.canSend(LogLevel.DEBUG)) return;

				this._logger.debug(message);
			},

			error: (message: string): void => {
				if (!logger.canSend(LogLevel.ERROR)) return;

				this._logger.error(message);
			},

			format: (message: string): string => message,

			get logLevel(): LogLevel {
				return LogLevel.INFO;
			},

			setLevel: (level: LogLevel): void => void 0,

			_log: (level: LogLevel, message: string): void => {
				switch (level) {
					case LogLevel.DEBUG: {
						logger.debug(message);
					} break;

					case LogLevel.ERROR: {
						logger.error(message);
					} break;

					case LogLevel.WARN: {
						logger.warn(message);
					} break;

					case LogLevel.INFO: {
						logger.info(message);
					} break;


					case LogLevel.NONE:
					default: {
						this._logger.log(message);
					} break;
				}
			},

			log: (level: LogLevel, message: string): void => {
				logger._log(level, message);
			},

			getDateTime: (): string => new Date().toLocaleDateString()
		};

		return logger as unknown as Logger;
	}
}

export default Client;