import { createLogger } from '~/structures/logger';
import config from '@web-config.json';
import cors from '@elysiajs/cors';
import { Elysia } from 'elysia';


const app = new Elysia();
const logger = createLogger('API');

// Add CORS middleware
app.use(cors({
	origin: '*', // In production, you might want to restrict this to specific origins
	methods: ['GET'], // We only need GET for media
	credentials: true,
}));

app.get('/media/:path', ({ params: { path } }) => Bun.file(`./cache/${path}`));

app.listen({ port: config.apiPort }, (server) => logger.success(`Now available on port ${server.port}.`));