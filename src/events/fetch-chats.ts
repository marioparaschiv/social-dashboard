import type { FetchedChats, SelectableChannel } from '@shared/types';
import { clients as telegramClients } from '~/telegram';
import { clients as discordClients } from '~/discord';
import { createLogger } from '~/structures/logger';
import { DispatchType } from '@shared/constants';
import { cacheItem } from '~/file-cache';
import type { WebSocket } from 'ws';
import { utils } from 'telegram';
import { send } from '~/socket';
import { hash } from '~/utils';


const logger = createLogger('WebSocket', 'Fetch Chats');

async function handler(ws: WebSocket) {
	if (!ws.authenticated) return;

	console.log('got fetch chats');

	const chats: FetchedChats = { discord: [], telegram: [] };

	for (const client of telegramClients) {
		try {
			const dialogs = await client.getDialogs();
			const channels: SelectableChannel[] = [];

			for (const dialog of dialogs) {
				let icon;

				const originPhoto = await client.downloadProfilePhoto(dialog.entity) as Buffer | null;
				const originAvatar = originPhoto?.length ? hash(originPhoto.buffer as ArrayBuffer) : 'none';
				if (originAvatar) icon = cacheItem(originAvatar, 'png', originPhoto.buffer as ArrayBuffer);

				channels.push({
					icon,
					id: dialog.id.toString(),
					name: utils.getDisplayName(dialog.entity)
				});
			}

			chats.telegram = [...chats.telegram, ...channels];
		} catch (error) {
			logger.error(`Failed to get chats for client: ${client}`);
		}
	}

	for (const client of discordClients) {
		const channels: SelectableChannel[] = [];

		for (const channel of client.channels.values()) {
			const guild = channel.guild_id && client.guilds.get(channel.guild_id);

			channels.push({
				icon: null,
				name: (guild ? `${guild.name} → ${channel.name}` : channel.name) ?? channel.recipients.map(r => r.username).join(', '),
				id: channel.id
			});
		}

		chats.discord = channels;
	}

	ws.chats = chats;

	return send(ws, DispatchType.FETCH_CHATS_RESPONSE, ws.chats);
}

export default handler;