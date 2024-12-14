import { getLatestBuildNumber } from '~/discord/api';
import Client from '~/discord/client';
import config from '@config.json';


async function init() {
	await getLatestBuildNumber();

	for (const account of config.discord.accounts) {
		const client = new Client(account);

		client.start();
	}
}

export default { init };