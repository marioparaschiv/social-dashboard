import Client from '~/telegram/client';
import config from '@config.json';


async function init() {
	for (const { apiHash, apiId, phoneNumber } of config.telegram.accounts) {
		const client = new Client({ apiHash, apiId, phoneNumber });

		await client.initialize(phoneNumber);
	}
}

export default { init };