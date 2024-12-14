import { BUILD_NUMBER_LENGTH, BUILD_NUMBER_STRING } from '~/discord/constants';
import type { GetMessageOptions, Message } from '@types';
import { createLogger } from '~/structures/logger';
import { sleep } from '~/utilities';
import config from '@config.json';


const logger = createLogger('Discord', 'API');

export async function getMessage(options: GetMessageOptions): Promise<Message | null> {
	options.retriesRemaining ??= 3;

	const { channel, message, retriesRemaining } = options;

	if (retriesRemaining === 0) return null;

	const res = await fetch(`https://discord.com/api/v10/channels/${channel}/messages?around=${message}&limit=1`, {
		headers: {
			'Authorization': options.token,
			'X-Super-Properties': btoa(JSON.stringify(config.discord.superProperties))
		}
	});

	const json = await res.json();

	if (res.status !== 200) {
		await sleep((json?.retry_after ?? 1) * 1000);
		options.retriesRemaining--;
		logger.warn(`Got unexpected response while fetching message ${message} in channel ${channel}: ${json} (Status: ${res.status}, Retries Remaining: ${retriesRemaining})`);
		return await getMessage(options);
	}

	if (!Array.isArray(json)) {
		return null;
	}

	return json?.[0] as Message;
}

export async function getLatestBuildNumber() {
	logger.info('Getting latest client build number to avoid account suspensions...');

	const doc = await fetch('https://discord.com/app').then(r => r.text());

	const scripts = doc.match(/\/assets\/web\.([a-z]|[0-9]).*?.js/gmi);

	if (!scripts?.length) {
		logger.error('Failed to get latest build number.');
		return process.exit(-1);
	}

	// Reverse the script collection as the script containing the build number is usually at the end.
	for (const script of scripts.reverse()) {
		try {
			const js = await fetch('https://discord.com' + script, {
				headers: {
					Origin: 'https://discord.com/',
					Referer: 'https://discord.com/app'
				}
			}).then(r => r.text());

			const idx = js.indexOf(BUILD_NUMBER_STRING);
			if (idx === -1) continue;

			const build = js.slice(idx + BUILD_NUMBER_STRING.length, (idx + BUILD_NUMBER_STRING.length) + BUILD_NUMBER_LENGTH);
			const buildNumber = Number(build);

			if (Number.isNaN(buildNumber)) {
				throw new Error(`Expected build number to be a number. Got NaN. String: ${build}`);
			}

			config.discord.superProperties.client_build_number = Number(build);
			logger.success('Fetched latest client build number:', config.discord.superProperties.client_build_number);

			break;
		} catch (error) {
			logger.error('Failed to make request while getting latest build number:', error);
		}
	}
}

export default { getMessage, getLatestBuildNumber };