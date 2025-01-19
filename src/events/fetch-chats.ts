import type { FetchedChats, SelectableChannel } from '@shared/types';
import { clients as telegramClients } from '~/telegram';
import { clients as discordClients } from '~/discord';
import { createLogger } from '~/structures/logger';
import { DispatchType } from '@shared/constants';
import { externalChats, send } from '~/socket';
import type { WebSocket } from 'ws';
import { utils } from 'telegram';


const logger = createLogger('WebSocket', 'Fetch Chats');

async function handler(ws: WebSocket) {
	if (!ws.authenticated) return;

	const chats: FetchedChats = { discord: [], telegram: [] };

	for (const client of telegramClients) {
		try {
			const dialogs = await client.getDialogs();
			const channels: SelectableChannel[] = [];

			for (const dialog of dialogs) {
				channels.push({
					platform: 'telegram',
					id: dialog.id.toString(),
					name: utils.getDisplayName(dialog.entity)
				});
			}

			const externals = externalChats.values().filter(e => e.platform === 'telegram');
			chats.telegram = [...chats.telegram, ...channels, ...externals];
		} catch (error) {
			logger.error(`Failed to get chats for client: ${client}`);
		}
	}

	for (const client of discordClients) {
		const channels: SelectableChannel[] = [];

		for (const channel of client.channels.values()) {
			const guild = channel.guild_id && client.guilds.get(channel.guild_id);

			channels.push({
				platform: 'discord',
				name: (guild ? `${guild.name} → ${channel.name}` : channel.name) ?? channel.recipients.map(r => r.username).join(', '),
				id: channel.id
			});
		}

		const externals = externalChats.values().filter(e => e.platform === 'discord');
		chats.discord = [...channels, ...externals];
	}

	return send(ws, DispatchType.FETCH_CHATS_RESPONSE, chats);
}

export default handler;