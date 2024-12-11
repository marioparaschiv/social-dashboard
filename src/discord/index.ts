import { getLatestBuildNumber } from '~/discord/api';
import config from '@config.json';
import Client from '~/discord/client';


async function init() {
	await getLatestBuildNumber();

	for (const account of config.discord.accounts) {
		const client = new Client(account);

		client.start();
	}
}

init();
