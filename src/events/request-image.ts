import { DispatchType } from '@shared/constants';
import { FILE_CACHE_PATH } from '~/constants';
import type { RequestImage } from '@types';
import { existsSync } from 'node:fs';
import type { WebSocket } from 'ws';
import { fileToURL } from '~/utils';
import { join } from 'node:path';
import { send } from '~/socket';


function handler(ws: WebSocket, payload: RequestImage) {
	if (!ws.authenticated || !payload.hash) return;

	const path = join(FILE_CACHE_PATH, payload.hash);
	if (!existsSync(path)) return;

	const data = fileToURL(path);

	send(ws, DispatchType.IMAGE_RESPONSE, {
		hash: payload.hash,
		data
	});
}

export default handler;