import { once } from 'node:events';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
const s = createApp({ catalogFile: new URL('../data/catalog.json', import.meta.url) });
s.listen(0, '127.0.0.1'); await once(s, 'listening');
try {
  const base = `http://127.0.0.1:${s.address().port}`;
  const list = await (await fetch(base + '/creatures?type=folha&ability=trama&limit=2')).json();
  assert.equal(list.count, 3); assert.deepEqual(list.results.map(r => r.id), ['aurifol', 'folhisco']);
  const next = await (await fetch(base + list.next)).json(); assert.equal(next.results[0].id, 'silvitrama');
  console.log(JSON.stringify(list, null, 2));
  const detail = await (await fetch(base + list.results[0].url)).json(); assert.equal(detail.resource.types[0].id, 'folha');
  console.log('Detalhe e relações de Aurifol verificados. Próxima página: Silvitrama.');
} finally { await new Promise(resolve => s.close(resolve)); }
