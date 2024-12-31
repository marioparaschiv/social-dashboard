import { channelPredicate, chatPredicate, dmPredicate } from '~/telegram/predicates';
import type { TelegramClientParams } from 'telegram/client/telegramBaseClient';
import type { StoreItem, StoreItemAttachment, TelegramListener } from '@types';
import { getTelegramEntityDetails } from '~/utils/get-entity-details';
import { NewMessage, type NewMessageEvent } from 'telegram/events';
import { TelegramClient } from 'telegram/client/TelegramClient';
import { LogLevel } from 'telegram/extensions/Logger';
import { Logger } from 'telegram/extensions/Logger';
import { createLogger } from '~/structures/logger';
import { stripPhoneNumber } from '~/utils/strip';
import { getTelegramListeners } from '~/config';
import { input } from '@inquirer/prompts';
import { cacheItem } from '~/file-cache';
import mimeTypes from 'mime-types';
import Storage from '~/storage';
import { hash } from '~/utils';
import { Api } from 'telegram';


interface ClientOptions {
	phoneNumber: string;
	apiId: number;
	apiHash: string;
	params?: TelegramClientParams;
}

class Client extends TelegramClient {
	private _logger!: ReturnType<typeof createLogger>;
	public accountIndex: number;

	constructor(options: ClientOptions, accountIndex: number) {
		// Use a pre-constructor trick to set _logger before super()
		const proto = new.target.prototype;

		Object.defineProperty(proto, '_logger', {
			value: createLogger('Telegram', stripPhoneNumber(options.phoneNumber)),
			writable: true,
			configurable: true
		});

		const cache = `.credentials[${options.phoneNumber.replace(/[^a-zA-Z0-9]/g, '_')}]`;

		super(cache, options.apiId, options.apiHash, options.params ?? { connectionRetries: Infinity });

		this.accountIndex = accountIndex;

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

		const origin = await event.getChat() as Api.Chat | Api.Channel | Api.PeerUser | Api.User;
		const reply = await event.message.getReplyMessage();
		if (!origin) return;

		const author = await event.message.getSender();
		if (!author || (author.className !== 'Channel' && author.className !== 'User')) return;

		const listeners = getTelegramListeners();
		const matchedListeners: TelegramListener[] = [];

		switch (origin.className) {
			case 'Channel': {
				const filtered = listeners.filter((listener) => channelPredicate(listener, event, author, origin, reply));
				if (filtered.length) matchedListeners.push(...filtered);
			} break;

			case 'Chat': {
				const filtered = listeners.filter((listener) => chatPredicate(listener, event, author, origin));
				if (filtered.length) matchedListeners.push(...filtered);
			} break;

			case 'PeerUser':
			case 'User': {
				const filtered = listeners.filter((listener) => dmPredicate(listener, event, author, origin));
				if (filtered.length) matchedListeners.push(...filtered);
			} break;
		}

		if (!matchedListeners.length) return;

		const originPhoto = await this.downloadProfilePhoto(origin) as Buffer | null;
		const originAvatar = originPhoto?.length ? hash(originPhoto.buffer as ArrayBuffer) : 'none';
		if (originAvatar) cacheItem(originAvatar, originPhoto.buffer as ArrayBuffer);

		const authorPhoto = await this.downloadProfilePhoto(author) as Buffer | null;
		const authorAvatar = authorPhoto?.length ? hash(authorPhoto.buffer as ArrayBuffer) : 'none';
		if (authorAvatar) cacheItem(authorAvatar, authorPhoto.buffer as ArrayBuffer);

		const originId = await this.getPeerId(origin);

		const attachments: StoreItemAttachment[] = [];

		const files = await this.getFiles(event.message);
		for (const file of files) {
			cacheItem(file.hash, file.buffer);

			attachments.push({
				name: file.name,
				type: file.mimeType,
				identifier: file.hash
			});
		}

		const item: StoreItem<'telegram'> = {
			type: 'telegram',
			author: author.username ?? (author as Api.Channel).title ?? 'Unknown',
			authorAvatar,
			origin: await getTelegramEntityDetails(origin, reply),
			originAvatar,
			attachments,
			listeners: [...new Set(matchedListeners.map(l => l.name))],
			groups: [...new Set(matchedListeners.map(l => l.group))],
			content: event.message.rawText,
			parameters: {
				accountIndex: this.accountIndex,
				messageId: event.message.id.toString(),
				originId,
			},
			savedAt: Date.now(),
		};

		Storage.add(item);
	}

	async getFiles(message: Api.Message) {
		const files: {
			name: string,
			buffer: ArrayBuffer,
			mimeType: string;
			hash: string;
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

			const id = hash(buf.buffer as ArrayBuffer);
			const attrib = payload.attributes?.find(a => a.fileName)?.fileName;
			const ext = payload.mimeType ? payload.mimeType === 'audio/ogg' ? 'ogg' : mimeTypes.extension(payload.mimeType) : 'png';
			const file = `${id}.${ext}`;

			files.push({
				name: attrib ?? file,
				hash: id,
				buffer: buf.buffer as ArrayBuffer,
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

			warn: (...messages: string[]): void => {
				if (!logger.canSend(LogLevel.WARN)) return;

				this._logger.warn(...messages);
			},

			info: (...messages: string[]): void => {
				if (!logger.canSend(LogLevel.INFO)) return;

				this._logger.info(...messages);
			},

			debug: (...messages: string[]): void => {
				if (!logger.canSend(LogLevel.DEBUG)) return;

				this._logger.debug(...messages);
			},

			error: (...messages: string[]): void => {
				if (!logger.canSend(LogLevel.ERROR)) return;

				this._logger.error(...messages);
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