import type { DispatchPayload } from '@shared/types';
import { createLogger } from '~/structures/logger';
import { DispatchType } from '@shared/constants';
import { WebSocket, WebSocketServer } from 'ws';
import config from '@web-config.json';
import storage from '~/storage';
import handlers from '~/events';


const server = new WebSocketServer({ port: config.port });
const logger = createLogger('Socket', 'Server');

export const clients = new Set<WebSocket>();

server.on('connection', (ws: WebSocket) => {
	logger.debug(`A new client has connected.`);

	ws.authenticated = false;
	ws.chats = { telegram: [], discord: [] };

	const onUpdate = onDataUpdate.bind(null, ws);
	storage.on('updated', onUpdate);

	ws.on('close', (code, reason) => {
		logger.debug(`Client disconnected. (Code: ${code ?? 'Unknown'})`);
		storage.off('updated', onUpdate);
	});

	ws.on('message', (data) => {
		try {
			const payload = JSON.parse(data.toString());
			if (!payload.type) return;

			console.log(payload);
			const handler = handlers[payload.type];
			if (!handler) return;

			handler(ws, payload);
		} catch (error) {
			console.error('Failed to parse WebSocket message from client:', error);
		}
	});

	// Notify the client that we are ready for [DispatchType.AUTH_REQUEST]
	send(ws, DispatchType.WELCOME);
});

function onDataUpdate(ws: WebSocket) {
	if (!ws.authenticated) return;

	send(ws, DispatchType.DATA_UPDATE, { data: storage.storage });
}

export function send<T extends DispatchType>(ws: WebSocket, type: T, payload?: DispatchPayload[T]) {
	try {
		const stringified = JSON.stringify({ ...payload, type });
		ws.send(stringified);
	} catch (error) {
		console.error('Failed to send WebSocket message to client:', error);
	}
}

logger.success(`Initialized WebSocket server on port ${config.port}.`);