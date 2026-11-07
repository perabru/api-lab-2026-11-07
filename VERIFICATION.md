# Verificação — 07/11/2026

Linux, Node.js v24.22.1. Sem dependências externas instaladas.

Comandos executados na raiz:
```bash
npm test
npm run check:data
npm run demo
```

**10 testes aprovados, 0 falhas, 0 cancelados, 0 ignorados; exit code 0.** Runner: 393.686785 ms (duração variável).

1. Health e identificação fictional em listas/detalhes.
2. Filtros tipo + habilidade com AND.
3. Busca sem acentos/maiúsculas e % literal.
4. Travessia sem repetição em conjunto estático e filtros nos links.
5. Todos os links de recursos resolvem; relações reversas concordam.
6. Paginação aninhada preserva caminho e filtro adicional.
7. Filtros inválidos, vazios, repetidos e limites retornam 400.
8. Página vazia/além do fim, 404, métodos de escrita rejeitados e URL longa.
9. Dados duplicados, referências quebradas, ausência de identificação fictícia e JSON inválido rejeitados; snapshot imutável.
10. Dois processos Node reais, com término e reinício: catálogo idêntico e arquivo-fonte sem alteração.

check:data: exit code 0, catálogo válido com 8 criaturas fictícias, 4 tipos e 4 habilidades.

Demo: exit code 0. Consulta folha + trama com limit 2: count 3; primeira página Aurifol/Folhisco, próxima Silvitrama. Detalhes e referências de Aurifol conferidos por asserções. Resposta completa reproduzida no README.

O npm emitiu aviso sobre http-proxy da configuração ambiental; o projeto não adiciona essa opção.

Limites: somente leitura, sem persistência de mutações por HTTP. O JSON versionado é a fonte persistente; reinício recarrega esse arquivo. Não testa serviço externo, carga, Windows ou hospedagem. Dados de demonstração originais, sem validação biológica ou mecânica de jogo. Limites máximos de tamanho/quantidade do catálogo estão implementados, mas não foram preenchidos até o teto nesta execução.
