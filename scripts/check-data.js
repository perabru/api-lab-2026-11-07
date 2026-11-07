import { loadCatalog } from '../src/catalog.js';
const c = loadCatalog(process.argv[2] ?? new URL('../data/catalog.json', import.meta.url));
console.log(`Catálogo válido: ${c.creatures.length} criaturas fictícias, ${c.types.length} tipos, ${c.abilities.length} habilidades.`);
