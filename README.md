![Fable Atlas — explore relações, imagine criaturas](brand/banner.svg)

# Fable Atlas API

Um catálogo local para aprender a consultar recursos relacionados e montar protótipos de bestiários. Encontre criaturas por tipo, habilidade ou texto e navegue pelas páginas sem perder os filtros.

**Dia 05/10 · 07/11/2026 · Node.js 22+ · sem dependências externas · 10 testes aprovados**

[Rotas](#rotas) · [Dados](data/catalog.json) · [Verificação](VERIFICATION.md) · [Anúncio](ANNOUNCEMENT.md) · [LinkedIn](LINKEDIN.md) · [Contribuir](CONTRIBUTING.md)

**Todas as 8 criaturas, 4 categorias de tipo e 4 habilidades são dados fictícios originais de demonstração.** Não são registros de animais reais ou dados Pokémon. A PokéAPI é uma referência de estudo; este código não consulta o provedor, não é afiliado e não implementa suas mecânicas de jogo.

Código publicado para execução local. Não há endpoint público hospedado ou interface gráfica nesta entrega.

## Comece aqui

Requisito: Node.js 22 ou superior. Verificado com **v24.22.1**. Não precisa npm install.

```bash
git clone https://github.com/perabru/api-lab-2026-11-07.git
cd api-lab-2026-11-07
npm start
```

Em outro terminal:
```bash
curl http://127.0.0.1:3000/health
curl 'http://127.0.0.1:3000/creatures?type=folha&ability=trama&limit=2'
```

Health retorna 200: `{"status":"ok","fictional":true,"creatures":8}`. Consulta filtrada retorna 200, resposta verificada na demo:

```json
{
  "fictional": true,
  "count": 3,
  "next": "/creatures?type=folha&ability=trama&limit=2&offset=2",
  "previous": null,
  "results": [
    {"id":"aurifol","name":"Aurifol","url":"/creatures/aurifol"},
    {"id":"folhisco","name":"Folhisco","url":"/creatures/folhisco"}
  ]
}
```

Siga next no mesmo servidor:
```bash
curl 'http://127.0.0.1:3000/creatures?type=folha&ability=trama&limit=2&offset=2'
curl http://127.0.0.1:3000/creatures/aurifol
curl http://127.0.0.1:3000/types/folha/creatures
```

A próxima página contém Silvitrama. O detalhe retorna `{fictional:true,resource:{...}}`, incluindo id, name, description e types/abilities como referências `{id,name,url}`. Listas retornam resumos; siga url para os detalhes. Links são caminhos relativos para não confiar no cabeçalho Host do cliente.

## Rotas

| Método | Rota | Uso |
|---|---|---|
| GET | /health | Estado e quantidade de criaturas |
| GET | /creatures | Lista paginada e filtros combinados |
| GET | /creatures/:id | Criatura e referências a tipos/habilidades |
| GET | /types | Tipos paginados |
| GET | /types/:id | Tipo e creatures_url |
| GET | /types/:id/creatures | Criaturas daquele tipo |
| GET | /abilities | Habilidades paginadas |
| GET | /abilities/:id | Habilidade e creatures_url |
| GET | /abilities/:id/creatures | Criaturas com aquela habilidade |

Somente GET. POST, PATCH e DELETE em recursos conhecidos retornam 405 com Allow: GET. Não há cadastro nem alteração por HTTP.

## Filtros e paginação

| Parâmetro | Regra |
|---|---|
| type | ID exato de tipo existente; somente listas de criaturas |
| ability | ID exato de habilidade existente; somente listas de criaturas |
| q | Trecho em nome/descrição, até 80 caracteres; ignora acentos e maiúsculas |
| limit | Inteiro 1–100, padrão 20 |
| offset | Inteiro 0–100000, padrão 0 |

- Filtros combinam com **AND** e são aplicados antes da paginação.
- Nas rotas aninhadas, o vínculo do caminho também é obrigatório; filtros adicionais podem reduzir a lista.
- q interpreta % e _ literalmente; não há expressão regular ou curinga.
- Parâmetros desconhecidos, repetidos, vazios ou fora do limite retornam 400.
- type/ability inexistentes retornam 400/unknown_filter. ID ausente no caminho retorna 404.
- Ordem estável por id crescente, comparação lexical ASCII; não depende da ordem do arquivo.
- count é a quantidade filtrada; results é a página. next/previous preservam filtros e rota.
- offset além do fim retorna página vazia; previous aponta à página anterior ou à última página válida. Conjunto vazio não tem previous.
- Detalhes e health não aceitam filtros. Não há barra final nas rotas.

## Dados e contribuição

O arquivo **data/catalog.json** é a fonte persistente e versionada. Carregado e congelado em memória na inicialização; nenhuma requisição altera o arquivo. Edite-o via contribuição e reinicie para carregar mudanças. Não há banco nem arquivos de execução.

```bash
npm run check:data
npm test
npm run demo
```

Resultado real em 07/11/2026: **10 testes aprovados, 0 falhas**. Validador: 8 criaturas, 4 tipos e 4 habilidades válidos. A demo faz asserções de filtros, próxima página e referências em servidor temporário. [Relatório e alcance](VERIFICATION.md).

O validador bloqueia IDs duplicados, textos inválidos e vínculos quebrados. Limites por coleção: 1–1000 registros; arquivo até 1 MiB; id até 40 caracteres, name até 80, description até 500; 1–3 tipos e habilidades por criatura, sem repetições. IDs são únicos dentro de cada coleção. Campos adicionais do JSON não têm semântica garantida: mantenha o formato existente.

**Melhoria concreta:** [guia para adicionar criaturas originais](CONTRIBUTING.md), comando check:data e [formulário de bug](https://github.com/perabru/api-lab-2026-11-07/issues/new?template=bug_report.yml) com URL, filtros e página. Sugira uma relação ou um caso de borda por issue; melhorias de documentação são bem-vindas.

## Erros e limites

Erros coerentes: `{"error":{"code":"unknown_filter","message":"type não cadastrado."}}`.

| Status | Situação |
|---|---|
| 400 | Consulta inválida ou filtro desconhecido |
| 404 | Rota ou recurso ausente |
| 405 | Método indisponível |
| 414 | URL acima de 2048 caracteres |
| 500 | Erro interno inesperado |

Use localmente. Padrões: HOST=127.0.0.1 e PORT=3000; CATALOG_FILE pode indicar outro JSON. Exemplo Bash:
```bash
PORT=3100 CATALOG_FILE=./data/catalog.json npm start
```

O JSON deve passar na validação antes de abrir a porta. Arquivo ausente, inválido ou relação quebrada interrompe inicialização, sem sobrescrever nada. O snapshot inteiro fica em memória. Não há autenticação, editor, combate, evolução, balanceamento ou garantia de adequação para produção. Não há acesso a serviço público, cache remoto ou credenciais; as respostas usam Cache-Control: no-store. Dados carregados permanecem no processo até reiniciar. requestTimeout e headersTimeout configurados em 10 s no executável.

## Referência oficial — consultada em 07/11/2026

[PokéAPI v2](https://pokeapi.co/docs/v2): estudo de recursos nomeados, paginação limit/offset e referências entre criaturas, tipos e habilidades. O contrato local usa IDs textuais e filtros próprios; não é compatível com todas as rotas do provedor. Nenhum dado ou imagem foi importado da PokéAPI.

## 💛 Apoie a continuidade

![Apoio voluntário por Pix](https://raw.githubusercontent.com/perabru/peradev-apis/main/brand/pix-support.svg)

Se este exemplo ajudou você a aprender ou prototipar, uma colaboração voluntária incentiva a continuidade e novas APIs.

### Chave Pix — copie e cole

```text
bruno.pera@unifesp.br
```

**Seu apoio é opcional. O código continua aberto e gratuito para todos**, sem promessa de contrapartidas.

## English summary

Local read-only catalog of eight original fictional creatures, four types and four abilities. Combined filters, accent-insensitive search, related resources and pagination links that retain filters. Ten tests passed, including real HTTP and process restart. Node.js core only; no PokéAPI integration or hosted endpoint.

**Licença MIT · Bruno Michel Pera** · [Calendário](https://github.com/perabru/peradev-apis/blob/main/docs/10-days.md)

[Post bilíngue publicado e verificado em 07/11/2026](https://www.linkedin.com/feed/update/urn:li:activity:7524774666121453568/).
