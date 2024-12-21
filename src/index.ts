import '~/socket';

import { createLogger } from '~/structures/logger';
import { initializeCache } from '~/file-cache';
import Telegram from '~/telegram';
import Discord from '~/discord';


export const logger = createLogger('Main');

async function start() {
	await initializeCache();

	// Storage.on('updated', () => {
	// 	console.log('storage updated', [...Storage.storage.values()]);
	// });

	await Promise.allSettled([Telegram.init(), Discord.init()]);
	logger.success('Successfully initialized backend.');
}

start();
