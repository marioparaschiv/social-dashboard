import type { SubscribeChats } from '@shared/types';
import type { WebSocket } from 'ws';


function handler(ws: WebSocket, payload: SubscribeChats) {
	if (!ws.authenticated) return;

	const { chats } = payload;

	ws.chats = chats;
}

export default handler;