import webConfig from '../web-config.json';


export enum DispatchType {
	WELCOME = 'welcome',
	DATA_UPDATE = 'data-update',
	AUTH_RESPONSE = 'auth-response',
	IMAGE_RESPONSE = 'image-response',
	VIDEO_RESPONSE = 'video-response',
	REPLY_RESPONSE = 'reply-response',
	REQUEST_DATA = 'request-data',
	REQUEST_AUTH = 'request-auth',
	REQUEST_IMAGE = 'request-image',
	REQUEST_VIDEO = 'request-video',
	REQUEST_REPLY = 'request-reply',

	ADD_CHATS_REQUEST = 'add-chats',
	ADD_CHATS_RESPONSE = 'add-chats-response',

	FETCH_CHATS = 'fetch-chats',
	FETCH_CHATS_RESPONSE = 'fetch-chats-response'
}

export const API_URL = `http${webConfig.apiSSL ? 's' : ''}://${webConfig.ip}${webConfig.apiPort ? ':' + webConfig.apiPort : ''}`;