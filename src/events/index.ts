import type { WebSocket } from 'ws';

import subscribeChats from './subscribe-chats';
import requestVideo from './request-video';
import requestReply from './request-reply';
import requestImage from './request-image';
import requestData from './request-data';
import requestAuth from './request-auth';
import fetchChats from './fetch-chats';


export type EventHandler = (ws: WebSocket, payload: any) => void;

const handlers: Record<string, EventHandler> = {
	'request-auth': requestAuth,
	'request-data': requestData,
	'request-image': requestImage,
	'request-video': requestVideo,
	'request-reply': requestReply,
	'fetch-chats': fetchChats,
	'subscribe-chats': subscribeChats
};

export default handlers;