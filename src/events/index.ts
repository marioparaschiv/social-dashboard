import type { WebSocket } from 'ws';


export type EventHandler = (ws: WebSocket, payload: any) => void;

import requestAuth from './request-auth';
import requestData from './request-data';
import requestImage from './request-image';
import requestVideo from './request-video';
import requestReply from './request-reply';

const handlers: Record<string, EventHandler> = {
	'request-auth': requestAuth,
	'request-data': requestData,
	'request-image': requestImage,
	'request-video': requestVideo,
	'request-reply': requestReply
};

export default handlers;