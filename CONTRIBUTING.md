# Contribua com uma criatura original

Edite data/catalog.json com uma criatura inventada, sem copiar nomes, imagens ou textos de franquias. Mantenha fictional=true e version=1. Escolha id único em minúsculas, começando com letra e usando letras, números ou hífen (até 40 caracteres). Tipos e habilidades devem existir e não se repetir no registro.

```bash
npm run check:data
npm test
npm run demo
```

O validador verifica IDs duplicados, textos, limites e referências antes de iniciar o servidor. Inclua um teste de filtro/relação quando mudar o contrato. Para relatar problema, informe URL completa, filtros, página e resultado esperado no formulário de bug. Não inclua dados pessoais, segredos ou arquivos de execução.

IDs são únicos dentro de cada coleção; URLs diferenciam criaturas, tipos e habilidades. O catálogo é somente leitura por HTTP. Reinicie para carregar mudanças no JSON.

Código e dados originais sob MIT. O Pix bruno.pera@unifesp.br é apoio voluntário à continuidade, sem contrapartidas; código aberto e gratuito.
