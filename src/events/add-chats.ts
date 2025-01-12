import type { AddChatsRequest } from '@shared/types';
import { DispatchType } from '@shared/constants';
import type { WebSocket } from 'ws';
import { send } from '~/socket';


function handler(ws: WebSocket, payload: AddChatsRequest) {
	if (!ws.authenticated) return;

	const { uuid, ...chats } = payload;

	ws.chats = { ...ws.chats, ...chats };

	return send(ws, DispatchType.ADD_CHATS_RESPONSE, { uuid });
}

export default handler;