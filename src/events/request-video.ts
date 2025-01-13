import type { RequestVideo, VideoResponse } from '@shared/types';
import { DispatchType } from '@shared/constants';
import { FILE_CACHE_PATH } from '~/constants';
import { existsSync } from 'node:fs';
import type { WebSocket } from 'ws';
import { fileToURL } from '~/utils';
import { join } from 'node:path';
import { send } from '~/socket';


function handler(ws: WebSocket, payload: RequestVideo) {
	console.log(payload);
	if (!ws.authenticated || !payload.hash) return;


	const path = join(FILE_CACHE_PATH, payload.ext ? `${payload.hash}.${payload.ext}` : payload.hash);
	if (!existsSync(path)) return;

	const data = fileToURL(path);

	send(ws, DispatchType.VIDEO_RESPONSE, {
		hash: payload.hash,
		ext: payload.ext,
		data
	} as VideoResponse);
}

export default handler;