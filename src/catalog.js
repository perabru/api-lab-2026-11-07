import { readFileSync, statSync } from 'node:fs';

export function loadCatalog(file) {
  if (statSync(file).size > 1048576) throw Error('Catálogo acima de 1 MiB.');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (data.version !== 1 || data.fictional !== true || !['types', 'abilities', 'creatures'].every(k => Array.isArray(data[k]) && data[k].length > 0 && data[k].length <= 1000)) throw Error('Estrutura ou identificação fictícia inválida.');
  const txt = (s, max) => typeof s === 'string' && s.length <= max && s.trim().length > 0 && s === s.trim() && !/[\u0000-\u001f\u007f]/.test(s);
  for (const kind of ['types', 'abilities', 'creatures']) {
    const ids = new Set();
    for (const row of data[kind]) {
      if (!row || typeof row.id !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(row.id) || ids.has(row.id) || !txt(row.name, 80) || !txt(row.description, 500)) throw Error(`Registro inválido ou duplicado: ${kind}.`);
      ids.add(row.id);
    }
  }
  for (const creature of data.creatures) {
    for (const key of ['types', 'abilities']) {
      if (!Array.isArray(creature[key]) || creature[key].length < 1 || creature[key].length > 3 || new Set(creature[key]).size !== creature[key].length || !creature[key].every(id => data[key].some(r => r.id === id))) throw Error(`Referência inválida em ${creature.id}/${key}.`);
    }
  }
  // Freeze the complete snapshot, including arrays and nested records.
  const freeze = v => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
  return freeze(data);
}
