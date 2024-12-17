import { DispatchType, type AuthRequest } from '@shared/constants';
import type { WebSocket } from 'ws';
import storage from '~/storage';
import { send } from '~/socket';


function handler(ws: WebSocket, payload: AuthRequest) {
	if (!ws.authenticated) return;

	send(ws, DispatchType.DATA_UPDATE, { data: [...storage.storage.values()] });
}

export default handler;