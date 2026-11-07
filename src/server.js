import { createApp } from './app.js';
const port = process.env.PORT ?? '3000';
if (!/^\d{1,5}$/.test(port) || Number(port) > 65535) throw Error('PORT inválida.');
const server = createApp({ catalogFile: process.env.CATALOG_FILE ?? new URL('../data/catalog.json', import.meta.url) });
server.requestTimeout = 10000;
server.headersTimeout = 10000;
server.listen(Number(port), process.env.HOST ?? '127.0.0.1', () => console.log(`Fable Atlas API: http://${server.address().address}:${server.address().port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
