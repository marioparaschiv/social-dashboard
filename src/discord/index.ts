import { getLatestBuildNumber } from '~/discord/api';
import Client from '~/discord/client';
import config from '@config.json';


export const clients: InstanceType<typeof Client>[] = [];

async function init() {
	await getLatestBuildNumber();

	for (const account of config.discord.accounts) {
		const client = new Client(account, clients.length);

		await client.start();
		clients.push(client);
	}
}

export default { init };