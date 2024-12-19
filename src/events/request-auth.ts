import type { AuthRequest, AuthResponse } from '@types';
import { DispatchType } from '@shared/constants';
import type { WebSocket } from 'ws';
import config from '@config.json';
import { send } from '~/socket';


function handler(ws: WebSocket, payload: AuthRequest) {
	if (config.password !== payload.password) {
		return send(ws, DispatchType.AUTH_RESPONSE, {
			failed: true
		} as AuthResponse);
	}

	send(ws, DispatchType.AUTH_RESPONSE, {
		failed: false
	} as AuthResponse);

	ws.authenticated = true;
}

export default handler;