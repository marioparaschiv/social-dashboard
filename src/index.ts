import './discord';

import Telegram from '~/telegram';
import Storage from '~/storage';


async function start() {
	Storage.on('updated', () => {
		console.log('storage updated');
	});

	Telegram.init();
}

start();
