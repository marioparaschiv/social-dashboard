import { clients as telegramClients } from '~/telegram';
import { clients as discordClients } from '~/discord';
import { DispatchType } from '@shared/constants';
import { sendMessage } from '~/discord/api';
import type { RequestReply } from '@types';
import { sleep } from '@shared/utils';
import type { WebSocket } from 'ws';
import { send } from '~/socket';


async function handler(ws: WebSocket, payload: RequestReply) {
	if (!ws.authenticated) return;

	const { uuid, parameters, messageType } = payload;
	if (!uuid || !parameters || !messageType) {
		return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
	}

	switch (payload.messageType) {
		case 'discord': {
			const request = payload as RequestReply<'discord'>;

			const { accountIndex, channelId, guildId, messageId } = request.parameters;
			if (accountIndex == void 0 || !channelId || !messageId) {
				return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
			}

			const client = discordClients[accountIndex];
			if (!client) {
				return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
			}

			const success = await sendMessage({
				token: client.token,
				channel: channelId,
				guild: guildId,
				message: {
					content: payload.content,
					message_reference: {
						channel_id: channelId,
						message_id: messageId
					}
				}
			});

			send(ws, DispatchType.REPLY_RESPONSE, { uuid, success });
		} break;

		case 'telegram': {
			const request = payload as RequestReply<'telegram'>;

			const { accountIndex, originId, messageId } = request.parameters;
			if (accountIndex == void 0 || !originId || !messageId) {
				return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
			}

			const client = telegramClients[accountIndex];
			if (!client) {
				return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
			}

			const dialogs = await client.getDialogs();

			const dialog = dialogs.find(r => r.id.toString() === request.parameters.originId);
			if (!dialog) {
				return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
			}

			let remainingRetries = 3;
			while (remainingRetries != 0) {
				try {
					await client.sendMessage(dialog.entity, {
						message: payload.content,
						replyTo: Number(messageId),
					});

					return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: true });
				} catch (e) {
					remainingRetries--;
					await sleep(1000);
				}
			}

			return send(ws, DispatchType.REPLY_RESPONSE, { uuid, success: false });
		}
	}
}

export default handler;