# LinkedIn — Fable Atlas API

Entrega: 07/11/2026. Estado: pendente de publicação após confirmação do código e ausência de duplicata no perfil Bruno Pera. Um post PT/EN, 2026 caracteres.

## Texto

🇧🇷 Um catálogo pequeno também precisa de relações confiáveis.

No dia 5 de “10 APIs em 10 dias”, publiquei a Fable Atlas API: oito criaturas fictícias originais, quatro tipos e quatro habilidades para estudar consultas de catálogo sem depender de serviços externos.

Implementei busca sem diferenciar acentos ou maiúsculas, filtros combinados por tipo e habilidade, detalhes relacionados e paginação com links que preservam os filtros.

Aprendizado: validar as referências do arquivo de dados antes de iniciar o servidor evita devolver links quebrados. O projeto inclui um comando de validação para quem quiser contribuir com novas criaturas.

10 testes passaram, incluindo HTTP real, travessia das páginas, relações reversas, entradas inválidas e reinício de processo. Node.js, sem dependências externas.

A PokéAPI foi a referência de estudo para recursos relacionados e paginação. Os dados desta API são próprios e explicitamente fictícios; não há integração com a PokéAPI ou endpoint hospedado.

🇬🇧 Small catalogs need reliable relationships too.

For day 5 of “10 APIs in 10 days”, I built Fable Atlas API: eight original fictional creatures, four types and four abilities for learning catalog queries locally.

It supports accent- and case-insensitive search, combined type/ability filters, related resources and pagination links that retain filters.

My takeaway: validate data references before starting the server to prevent broken resource links. A data-check command helps contributors add creatures safely.

All 10 tests passed, covering real HTTP requests, page traversal, reverse relationships, invalid input and process restart. Node.js, no external dependencies.

PokéAPI inspired the resource and pagination design. This API uses its own clearly fictional dataset, without PokéAPI integration or a hosted endpoint.

Código / Code:
https://github.com/perabru/api-lab-2026-11-07

Que filtro ou regra você acrescentaria?
What filter or rule would you add? Feedback welcome!

#API #NodeJS #OpenSource #Backend
