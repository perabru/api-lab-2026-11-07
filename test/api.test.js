import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createApp } from '../src/app.js';
import { loadCatalog } from '../src/catalog.js';
const file = new URL('../data/catalog.json', import.meta.url);
async function fixture(t) { const s = createApp({ catalogFile: file }); s.listen(0, '127.0.0.1'); await once(s, 'listening'); t.after(() => new Promise(resolve => s.close(resolve))); return async (path, opts) => { const r = await fetch(`http://127.0.0.1:${s.address().port}${path}`, opts); return { status: r.status, headers: r.headers, body: await r.json() }; }; }

test('health and explicit fictional marker on lists/details', async t => {
  const get = await fixture(t); assert.deepEqual((await get('/health')).body, { status: 'ok', fictional: true, creatures: 8 });
  for (const path of ['/creatures', '/types', '/abilities', '/creatures/aurifol']) { const r = await get(path); assert.equal(r.status, 200); assert.equal(r.body.fictional, true); }
});
test('combines type and ability with AND', async t => {
  const get = await fixture(t); const r = await get('/creatures?type=folha&ability=trama');
  assert.equal(r.body.count, 3); assert.deepEqual(r.body.results.map(x => x.id), ['aurifol', 'folhisco', 'silvitrama']);
  assert.equal((await get('/creatures?type=cristal&ability=trama')).body.count, 0);
});
test('search ignores case and accents, treats wildcard characters literally', async t => {
  const get = await fixture(t); assert.equal((await get('/creatures?q=NEVOA')).body.count, 1);
  assert.equal((await get('/creatures?q=%25')).body.count, 0);
  assert.equal((await get('/creatures?q=aurifol')).body.results[0].id, 'aurifol');
});
test('pagination traverses every filtered item once; links retain filters', async t => {
  const get = await fixture(t); let path = '/creatures?type=folha&ability=trama&limit=1', all = [], last;
  while (path) { const r = (await get(path)).body; assert.equal(r.count, 3); all.push(...r.results.map(x => x.id)); last = r; path = r.next; if (path) { assert.equal(new URL(path, 'http://x').searchParams.get('ability'), 'trama'); } }
  assert.deepEqual(all, ['aurifol', 'folhisco', 'silvitrama']); assert.equal((await get(last.previous)).body.results[0].id, 'folhisco');
});
test('all resource links resolve and reverse relationships agree', async t => {
  const get = await fixture(t);
  for (const item of (await get('/creatures')).body.results) {
    const c = (await get(item.url)).body.resource;
    for (const kind of ['types', 'abilities']) for (const ref of c[kind]) {
      const d = (await get(ref.url)).body.resource; assert.equal(d.name, ref.name);
      assert.ok((await get(d.creatures_url)).body.results.some(r => r.id === c.id));
    }
  }
});
test('nested pagination keeps route and additional filters', async t => {
  const get = await fixture(t); const a = (await get('/types/folha/creatures?ability=trama&limit=1')).body;
  assert.equal(a.count, 3); assert.ok(a.next.startsWith('/types/folha/creatures?')); assert.equal((await get(a.next)).body.results[0].id, 'folhisco');
});
test('invalid filters, bounds, duplicates and detail parameters return 400', async t => {
  const get = await fixture(t);
  for (const path of ['/creatures?limit=0', '/creatures?limit=101', '/creatures?offset=-1', '/creatures?offset=100001', '/creatures?type=missing', '/creatures?ability=missing', '/creatures?q=', '/creatures?q=a&q=b', '/creatures?x=1', '/types?type=folha', '/creatures/aurifol?q=a', '/health?q=a', '/creatures?q='+'a'.repeat(81)]) assert.equal((await get(path)).status, 400, path);
});
test('empty and beyond-end pages, unknown routes and readonly methods', async t => {
  const get = await fixture(t); const r = (await get('/creatures?offset=99&limit=3')).body; assert.deepEqual(r.results, []); assert.equal(r.next, null); assert.equal((await get(r.previous)).body.results.length, 2);
  for (const path of ['/creatures/missing', '/types/missing/creatures', '/creatures/aurifol/creatures', '/unknown']) assert.equal((await get(path)).status, 404);
  for (const method of ['POST', 'PATCH', 'DELETE']) { const r = await get('/creatures', { method }); assert.equal(r.status, 405); assert.equal(r.headers.get('Allow'), 'GET'); }
  assert.equal((await get('/creatures?q='+'x'.repeat(2048))).status, 414);
});
test('data validation rejects duplicates, broken links and false provenance', () => {
  const temp = mkdtempSync(join(tmpdir(), 'atlas-')); const path = join(temp, 'catalog.json');
  try {
    const original = JSON.parse(readFileSync(file));
    const mutations = [c => c.creatures.push(c.creatures[0]), c => c.creatures[0].types.push('missing'), c => c.creatures[0].abilities.push(c.creatures[0].abilities[0]), c => { c.fictional = false; }, c => { delete c.types[0].id; }, c => { c.creatures[0].name = ''; }];
    for (const mutate of mutations) { const c = structuredClone(original); mutate(c); writeFileSync(path, JSON.stringify(c)); assert.throws(() => loadCatalog(path)); }
    writeFileSync(path, '{'); assert.throws(() => loadCatalog(path));
    const c = loadCatalog(file); assert.throws(() => c.creatures.push({})); assert.throws(() => c.creatures[0].types.push('x'));
  } finally { rmSync(temp, { recursive: true }); }
});
test('real process restart returns same catalogue, file remains unchanged', async () => {
  const before = readFileSync(file);
  async function run() {
    const proc = spawn(process.execPath, ['src/server.js'], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
      const [chunk] = await once(proc.stdout, 'data'); const address = chunk.toString().trim().split(' ').at(-1);
      const r = await fetch(address + '/creatures?type=folha&limit=2'); assert.equal(r.status, 200); return await r.json();
    } finally { const ended = once(proc, 'exit'); proc.kill('SIGTERM'); await ended; }
  }
  assert.deepEqual(await run(), await run()); assert.deepEqual(readFileSync(file), before);
});
