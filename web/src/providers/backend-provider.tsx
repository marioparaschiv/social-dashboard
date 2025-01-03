import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Dispatch, type RequestReply, type StoreItem } from '@types';
import { DispatchType } from '@shared/constants';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import config from '@web-config.json';
import { sleep } from '@shared/utils';
import { uuid } from '@shared/utils';


type SocketStates = 'idle' | 'connecting' | 'connected' | 'ready';

interface BackendContextProps {
	state: SocketStates;
	authenticated: boolean;
	data: StoreItem[];
	replyingTo: StoreItem | null;
	replyTo: (item: StoreItem | null) => void;
	send: (type: DispatchType, payload?: Record<PropertyKey, any>) => void;
	on: (type: DispatchType, callback: (...args: any[]) => any) => () => void;
	once: (type: DispatchType, callback: (...args: any[]) => any) => () => void;
	off: (type: DispatchType, callback: (...args: any[]) => any) => void;
	waitForDispatch: (type: DispatchType) => Promise<unknown>;
	readonly ws: WebSocket | null;
}

export const BackendContext = createContext<BackendContextProps>({
	send: () => void 0,
	replyingTo: null,
	replyTo: (item: StoreItem | null) => void 0,
	data: [],
	state: 'idle',
	authenticated: false,
	on: () => () => void 0,
	once: () => () => void 0,
	off: () => void 0,
	waitForDispatch: () => Promise.resolve(),
	ws: null
});

export const listeners = new Map<DispatchType, Set<(payload: Record<PropertyKey, any>) => any>>();

function BackendProvider({ children, ...props }: React.PropsWithChildren) {
	// Replying
	const [replyingTo, replyTo] = useState<StoreItem | null>(null);
	const [replyLoading, setReplyLoading] = useState(false);
	const [replyFailed, setReplyFailed] = useState(false);
	const [replyContent, setReplyContent] = useState('');

	const [{ data }, setData] = useState<{ data: StoreItem[]; }>({ data: [] });
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [state, setState] = useState<SocketStates>('idle');
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

		return () => off(type, callback);
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

		return () => off(type, callback);
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
		if (!password || state !== 'ready' || authenticated) return;

		send(DispatchType.REQUEST_AUTH, { password });
	}, [state, authenticated]);

	const ctx = {
		state,
		authenticated,
		data,
		replyingTo,
		replyTo,
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

			setState('connecting');
			setAuthenticated(false);

			const socket = new WebSocket('ws://' + config.ip + ':' + config.port);

			socket.binaryType = 'arraybuffer';

			ws.current = socket;

			socket.addEventListener('close', async () => {
				ws.current = null;
				setState('idle');

				console.log('Socket closed, waiting 1000ms then retrying...');
				await sleep(1000);

				createSocket();
			});

			socket.addEventListener('open', () => {
				console.info('Socket opened');
				setState('connected');
			});

			socket.addEventListener('message', (event) => {
				try {
					const payload = JSON.parse(event.data);

					console.log(`Received ${payload.type}`);

					emit(payload.type, payload);

					switch (payload.type) {
						case DispatchType.WELCOME: {
							console.log('WebSocket ready for authentication.');
							setState('ready');
						} break;

						case DispatchType.AUTH_RESPONSE: {
							if (!payload.success) return;

							setAuthenticated(true);
							send(DispatchType.REQUEST_DATA);
						} break;

						case DispatchType.DATA_UPDATE: {
							const { data } = payload;
							setData({ data });
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
			ws.current?.close();
		};
	}, []);

	return <BackendContext.Provider {...props} value={ctx}>
		<Dialog
			open={!!replyingTo}
			onOpenChange={(open) => {
				if (!open) {
					setReplyLoading(false);
					setReplyFailed(false);
					replyTo(null);
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Replying to {replyingTo?.author}</DialogTitle>
				</DialogHeader>
				<Input
					placeholder='Hey! How are you?'
					value={replyContent}
					data-failed={replyFailed}
					className='data-[failed=true]:!border-red-500 data-[failed=true]:border-2'
					onChange={(e) => {
						setReplyFailed(false);
						setReplyContent(e.target.value ?? '');
					}}
				/>
				{replyFailed && <span className='text-red-500'>Failed to reply to message. Does it still exist?</span>}
				<DialogFooter className='w-full'>
					<Button
						type='submit'
						className='w-full disabled:opacity-50'
						size='sm'
						disabled={replyLoading || !replyContent}
						onClick={async () => {
							if (!replyingTo) return;

							setReplyLoading(true);
							setReplyFailed(false);

							const id = uuid();

							send(DispatchType.REQUEST_REPLY, {
								messageType: replyingTo.type,
								content: replyContent,
								parameters: replyingTo.parameters,
								uuid: id
							} as RequestReply);

							const success = await new Promise<boolean>((resolve) => {
								const remove = on(DispatchType.REPLY_RESPONSE, (payload) => {
									if (payload.uuid !== id) return;

									remove();
									resolve(payload.success);
								});
							});

							setReplyFailed(!success);
							setReplyLoading(false);

							if (success) replyTo(null);
						}}
					>
						{replyLoading ? <LoaderCircle className='animate-spin' /> : 'Send'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		{children}
	</BackendContext.Provider>;
}

export default BackendProvider;