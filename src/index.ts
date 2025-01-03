import '~/socket';

import { createLogger } from '~/structures/logger';
import Telegram from '~/telegram';
import Discord from '~/discord';


export const logger = createLogger('Main');

async function start() {
	await Promise.allSettled([Telegram.init(), Discord.init()]);
	logger.success('Successfully initialized backend.');
}

start();
