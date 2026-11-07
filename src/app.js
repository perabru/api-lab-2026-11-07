import { createServer } from 'node:http';
import { loadCatalog } from './catalog.js';

class HttpError extends Error { constructor(status, code, message) { super(message); Object.assign(this, { status, code }); } }
const fail = (status, code, message) => { throw new HttpError(status, code, message); };
export function createApp({ catalogFile }) {
  const data = loadCatalog(catalogFile);
  const find = (kind, id) => { const r = data[kind].find(r => r.id === id); if (!r) fail(404, 'not_found', 'Recurso não encontrado.'); return r; };
  const ref = (kind, id) => ({ id, name: find(kind, id).name, url: `/${kind}/${id}` });
  const summary = (kind, row) => ({ id: row.id, name: row.name, url: `/${kind}/${row.id}` });
  const detail = row => ({ ...row, types: row.types.map(id => ref('types', id)), abilities: row.abilities.map(id => ref('abilities', id)) });
  return createServer((req, res) => {
    const send = (status, value, headers = {}) => { const b = JSON.stringify(value); res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(b), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers }); res.end(req.method === 'HEAD' ? undefined : b); };
    try {
      if (req.url.length > 2048) fail(414, 'uri_too_long', 'URL: máximo 2048 caracteres.');
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/health') {
        if (req.method !== 'GET') return send(405, { error: { code: 'method_not_allowed', message: 'Use GET.' } }, { Allow: 'GET' });
        if (url.search) fail(400, 'invalid_query', 'Health não aceita filtros.');
        return send(200, { status: 'ok', fictional: true, creatures: data.creatures.length });
      }
      const match = url.pathname.match(/^\/(creatures|types|abilities)(?:\/([a-z][a-z0-9-]{0,39}))?(?:\/(creatures))?$/);
      if (!match || (match[3] && (!match[2] || match[1] === 'creatures'))) fail(404, 'not_found', 'Rota não encontrada.');
      if (req.method !== 'GET') return send(405, { error: { code: 'method_not_allowed', message: 'Catálogo somente leitura; use GET.' } }, { Allow: 'GET' });
      const [, kind, id, nested] = match;
      if (id && !nested) {
        if (url.search) fail(400, 'invalid_query', 'Detalhes não aceitam filtros.');
        const row = find(kind, id);
        return send(200, { fictional: true, resource: kind === 'creatures' ? detail(row) : { ...row, creatures_url: `/${kind}/${id}/creatures` } });
      }
      if (nested) find(kind, id);
      const resource = nested ? 'creatures' : kind;
      const allowed = new Set(resource === 'creatures' ? ['type', 'ability', 'q', 'limit', 'offset'] : ['q', 'limit', 'offset']);
      const params = url.searchParams;
      for (const [key, value] of params) if (!allowed.has(key) || params.getAll(key).length !== 1 || !value.trim()) fail(400, 'invalid_query', 'Filtro desconhecido, vazio ou repetido.');
      const number = (key, fallback, min, max) => { const s = params.get(key) ?? String(fallback); if (!/^\d{1,6}$/.test(s) || Number(s) < min || Number(s) > max) fail(400, 'invalid_query', `${key} inválido.`); return Number(s); };
      const limit = number('limit', 20, 1, 100), offset = number('offset', 0, 0, 100000);
      const normalize = v => v.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
      const q = params.get('q'); if (q && (q.length > 80 || /[\u0000-\u001f\u007f]/.test(q))) fail(400, 'invalid_query', 'q inválido; máximo 80 caracteres.');
      for (const [key, target] of [['type', 'types'], ['ability', 'abilities']]) if (params.has(key) && !data[target].some(r => r.id === params.get(key))) fail(400, 'unknown_filter', `${key} não cadastrado.`);
      let rows = data[resource].filter(row => (!nested || row[kind].includes(id)) && (!params.has('type') || row.types.includes(params.get('type'))) && (!params.has('ability') || row.abilities.includes(params.get('ability'))) && (!q || normalize(row.name + ' ' + row.description).includes(normalize(q.trim()))));
      rows = [...rows].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      const count = rows.length;
      const page = newOffset => { const p = new URLSearchParams(params); p.set('limit', limit); p.set('offset', newOffset); return `${url.pathname}?${p}`; };
      return send(200, { fictional: true, count, next: offset + limit < count ? page(offset + limit) : null, previous: offset > 0 && count > 0 ? page(Math.max(0, Math.min(offset - limit, Math.floor((count - 1) / limit) * limit))) : null, results: rows.slice(offset, offset + limit).map(r => summary(resource, r)) });
    } catch (e) { send(e.status ?? 500, { error: { code: e.code ?? 'internal_error', message: e.status ? e.message : 'Erro interno.' } }); }
  });
}
