import Client from '~/telegram/client';
import config from '@config.json';


export const clients: InstanceType<typeof Client>[] = [];

async function init() {
	for (const { apiHash, apiId, phoneNumber } of config.telegram.accounts) {
		if (!phoneNumber) continue;

		const client = new Client({ apiHash, apiId, phoneNumber }, clients.length);

		await client.initialize(phoneNumber);

		clients.push(client);
	}
}

export default { init };