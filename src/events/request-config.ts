import type { ConfigResponse } from '@shared/types';
import { DispatchType } from '@shared/constants';
import webConfig from '@web-config.json';
import type { WebSocket } from 'ws';
import config from '@config.json';
import { send } from '~/socket';


function handler(ws: WebSocket) {
	if (!ws.authenticated) return;

	return send(ws, DispatchType.CONFIG_RESPONSE, {
		webConfig,
		config
	} as ConfigResponse);
}

export default handler;