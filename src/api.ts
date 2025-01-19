import { createLogger } from '~/structures/logger';
import type { StoreItem } from '@shared/types';
import webConfig from '@web-config.json';
import { externalChats } from '~/socket';
import bearer from '@elysiajs/bearer';
import { Elysia, t } from 'elysia';
import cors from '@elysiajs/cors';
import config from '@config.json';
import storage from '~/storage';


const app = new Elysia();
const logger = createLogger('API');

// Add CORS middleware
app.use(cors({
	origin: '*', // In production, you might want to restrict this to specific origins
	methods: ['GET', 'POST'], // We only need GET for media
	credentials: true,
}));

app.use(bearer()).onBeforeHandle(async ({ bearer, request, set }) => {
	if (!bearer) {
		set.status = 401;
		return { success: false, error: 'Missing authorization bearer token.' };
	}

	const isAuthorized = bearer === config.apiPassword;

	if (!isAuthorized) {
		set.status = 401;
		return { success: false, error: 'You are not authorized to use this endpoint.' };
	}
});

app.get('/media/:path', ({ params: { path } }) => Bun.file(`./cache/${path}`));


const embedSchema = t.Object({
	title: t.Optional(t.String()),
	description: t.Optional(t.String()),
	url: t.Optional(t.String()),
	timestamp: t.Optional(t.String()),
	color: t.Optional(t.Number()),
	footer: t.Optional(t.Object({
		text: t.String(),
		icon_url: t.Optional(t.String())
	})),
	image: t.Optional(t.Object({
		url: t.String()
	})),
	thumbnail: t.Optional(t.Object({
		url: t.String()
	})),
	video: t.Optional(t.Object({
		url: t.String()
	})),
	provider: t.Optional(t.Object({
		name: t.Optional(t.String()),
		url: t.Optional(t.String())
	})),
	author: t.Optional(t.Object({
		name: t.String(),
		url: t.Optional(t.String()),
		icon_url: t.Optional(t.String())
	})),
	fields: t.Optional(t.Array(t.Object({
		name: t.String(),
		value: t.String(),
		inline: t.Optional(t.Boolean())
	})))
});

const attachmentSchema = t.Object({
	name: t.String(),
	path: t.String(),
	type: t.String()
});

const discordParametersSchema = t.Object({
	messageId: t.String(),
	channelId: t.String(),
	guildId: t.Optional(t.String()),
	accountIndex: t.Number()
});

const telegramParametersSchema = t.Object({
	messageId: t.String(),
	originId: t.String(),
	accountIndex: t.Number()
});

const storeItemSchema = t.Object({
	savedAt: t.Number(),
	chat: t.Object({
		id: t.String(),
		name: t.String(),
		platform: t.String({ pattern: 'telegram|discord' })
	}),
	type: t.Union([
		t.Literal('discord'),
		t.Literal('telegram')
	]),
	id: t.String(),
	embeds: t.Array(embedSchema),
	edited: t.Boolean(),
	author: t.Object({
		name: t.String(),
		id: t.String()
	}),
	reply: t.Nullable(t.Object({
		author: t.String(),
		content: t.String(),
		attachmentCount: t.Number()
	})),
	content: t.Nullable(t.String()),
	attachments: t.Array(attachmentSchema),
	parameters: t.Union([
		discordParametersSchema,
		telegramParametersSchema
	])
});

app.post('/messages/:group', ({ body, params }) => {
	const group = params.group;

	const item = body as StoreItem;

	if (!externalChats.has(item.chat.id)) {
		externalChats.set(item.chat.id, item.chat);
	}

	logger.info(`Received external submission for group ${group}.`);
	storage.add(group, item);

	return { success: true };
}, { body: storeItemSchema });

storage.on('added', async (category: string, item: StoreItem) => {
	if (typeof config.externalSubmission !== 'object' && !Array.isArray(config.externalSubmission)) return;

	logger.debug('External submission started.');

	const requests = config.externalSubmission.map(async (submission) => {
		if (!submission.password || !submission.url) return;

		const url = new URL(submission.url);

		url.pathname = `/messages/${category}`;

		const res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(item),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${submission.password}`
			}
		}).catch((error) => {
			logger.error(`Failed external submission to ${submission.url}:`, error, { url: url.toString(), item });
		});

		if (res && !res.ok) {
			logger.error(`Failed external submission to ${submission.url}:`, {
				status: res.status,
				text: await res.text(),
				item
			});
		}
	});


	await Promise.allSettled(requests);
	logger.debug('External submission complete.');
});

app.listen({ port: webConfig.apiPort }, (server) => logger.success(`Now available on port ${server.port}.`));