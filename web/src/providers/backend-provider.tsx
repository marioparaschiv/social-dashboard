import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { DispatchType } from '@shared/constants';
import { sleep } from '@shared/utils';
import { Dispatch, type StoreItem, type StoreItemTypes } from '@types';
import config from '@web-config.json';


interface BackendContextProps {
	loading: boolean;
	authenticated: boolean;
	data: StoreItem<StoreItemTypes>[];
	send: (type: DispatchType, payload?: Record<PropertyKey, any>) => void;
	on: (type: DispatchType, callback: (...args: any[]) => any) => void;
	once: (type: DispatchType, callback: (...args: any[]) => any) => void;
	off: (type: DispatchType, callback: (...args: any[]) => any) => void;
	waitForDispatch: (type: DispatchType) => Promise<unknown>;
	readonly ws: WebSocket | null;
}

export const BackendContext = createContext<BackendContextProps>({
	send: () => void 0,
	data: [],
	loading: true,
	authenticated: false,
	on: () => void 0,
	once: () => void 0,
	off: () => void 0,
	waitForDispatch: () => Promise.resolve(),
	ws: null
});

export const listeners = new Map<DispatchType, Set<(payload: Record<PropertyKey, any>) => any>>();

function BackendProvider({ children, ...props }: React.PropsWithChildren) {
	const [{ data }, setData] = useState<{ data: StoreItem<StoreItemTypes>[]; }>({ data: [] });
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const ws = useRef<WebSocket | null>(null);

	const emit = useCallback((type: DispatchType, payload: any) => {
		const callbacks = listeners.get(type);

		for (const callback of callbacks ?? []) {
			try {
				callback(payload);
			} catch (error) {
				console.error(`Failed to run callback for ${type} event:`, error);
			}
		}
	}, []);

	const on = useCallback((type: DispatchType, callback: (...args: any[]) => any) => {
		const set = listeners.get(type) ?? new Set();

		if (set.size) {
			set.add(callback);
		} else {
			set.add(callback);
			listeners.set(type, set);
		}
	}, []);

	const once = useCallback((type: DispatchType, callback: (...args: any[]) => any) => {
		function onCallback(...args: any[]) {
			try {
				callback(...args);
			} catch (error) {
				console.error('Failed to call `once` callback:', error);
			} finally {
				off(type, onCallback);
			}
		}

		on(type, onCallback);
	}, []);

	const off = useCallback((type: DispatchType, callback: (...args: any[]) => any) => {
		const existing = listeners.get(type);
		if (!existing) return;

		existing.delete(callback);
	}, []);

	const waitForDispatch = useCallback((type: DispatchType, filter?: (dispatch: Dispatch) => any): Promise<Dispatch> => {
		return new Promise(resolve => {
			function callback(dispatch: Dispatch) {
				if (filter && !filter(dispatch)) return;
				off(type, callback);
				resolve(dispatch);
			}

			on(type, callback);
		});
	}, []);

	const send = useCallback((type: DispatchType, payload: Record<PropertyKey, any> = {}) => {
		if (!ws.current) return console.warn('Attempted to send data to the WebSocket in CLOSED state.');

		try {
			const stringified = JSON.stringify({ ...payload, type });
			ws.current!.send(stringified);
		} catch (error) {
			console.error('Failed to send WebSocket message to client:', error);
		}
	}, [ws.current]);

	useEffect(() => {
		const password = localStorage.getItem('password');
		if (!password || loading || authenticated) return;

		send(DispatchType.AUTH_REQUEST, { password });
	}, [loading, authenticated]);

	const ctx = {
		loading,
		authenticated,
		data,
		send,
		on,
		off,
		once,
		emit,
		waitForDispatch,
		get ws() {
			return ws.current;
		}
	};


	useEffect(() => {
		function onUnload() {
			ws.current?.close();
		}

		function createSocket() {
			if (ws.current) return;

			setLoading(true);
			setAuthenticated(false);

			const socket = new WebSocket('ws://' + config.ip + ':' + config.port);

			socket.binaryType = 'arraybuffer';

			ws.current = socket;

			socket.addEventListener('close', async () => {
				ws.current = null;

				console.log('Socket closed, waiting 1000ms then retrying...');
				await sleep(1000);

				createSocket();
			});

			socket.addEventListener('open', () => {
				console.info('Socket opened');
			});

			socket.addEventListener('message', (event) => {
				try {
					const payload = JSON.parse(event.data);

					console.log(`Received ${payload.type}`);

					emit(payload.type, payload);

					switch (payload.type) {
						case DispatchType.WELCOME: {
							console.log('WebSocket ready for authentication.');
							setLoading(false);
						} break;

						case DispatchType.AUTH_RESPONSE: {
							if (payload.failed) return;

							setAuthenticated(true);
							send(DispatchType.REQUEST_DATA);
						} break;

						case DispatchType.DATA_UPDATE: {
							const { data } = payload;
							setData({ data });
							console.log(data);
						} break;

						default: {
							console.log(`Received unknown dispatch:`, payload);
						} break;
					}
				} catch (e) {
					console.error('!!! Failed parsing WebSocket message !!!');
				}
			});
		}

		createSocket();
		document.addEventListener('beforeunload', onUnload);

		return () => {
			document.removeEventListener('beforeunload', onUnload);
			ws.current!.close();
		};
	}, []);

	return <BackendContext.Provider {...props} value={ctx} >
		{children}
	</BackendContext.Provider>;
}

export default BackendProvider;