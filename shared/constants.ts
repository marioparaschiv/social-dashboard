export enum DispatchType {
	WELCOME = 'welcome',
	AUTH_REQUEST = 'auth-request',
	AUTH_RESPONSE = 'auth-response',
	DATA_UPDATE = 'data-update',
	REQUEST_DATA = 'request-data'
}

export interface AuthRequest {
	password: string;
}

export interface AuthResponse {
	failed: boolean;
}