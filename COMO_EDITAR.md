# Como editar a Arena

Você pode editar este repositório diretamente no GitHub ou no computador. Após conectar o Worker à branch `main`, as alterações salvas nessa branch são publicadas pela Cloudflare.

## Edição pelo navegador do GitHub

1. Abra o arquivo que deseja alterar.
2. Clique no lápis **Edit this file**.
3. Faça a mudança.
4. Clique em **Commit changes** e descreva a alteração.
5. Depois da configuração inicial, acompanhe a publicação em Cloudflare → Workers & Pages → seu Worker → histórico de builds.

Para uma alteração maior, crie uma branch ou faça os testes no computador antes de atualizar `main`.

## Mapa dos arquivos

| O que você quer mudar | Arquivo | Orientação |
| --- | --- | --- |
| Títulos, subtítulos e nomes dos jogos | `src/catalog.mjs` | Procure `title` e `subtitle`. |
| Regras e pistas | `src/catalog.mjs` | Procure `rules` e `analysis`. |
| Exemplos e posições iniciais | `src/catalog.mjs` | Edite `variants`, respeitando os formatos descritos abaixo. |
| Cores, tamanhos e fontes | `src/style.css` | As variáveis no bloco `:root` controlam a paleta. O último bloco com a mesma variável prevalece. |
| Texto e desenho das telas | `src/client.mjs` | `home()` monta a página inicial; `shell()` monta a página de jogo; `draw()` mostra o tabuleiro. |
| Créditos e condições de uso | `src/client.mjs` | Procure `function credits()`. |
| Rodapé e descrição para buscadores | `src/index.html` | Edite `<footer>` e a meta `description`. |
| Regras válidas e vitória | `src/engine.mjs` | `play()` verifica jogadas e atualiza o estado; `createGame()` cria posições iniciais. |
| Comunicação e armazenamento das salas | `src/api.mjs` | Endpoints de criação, entrada e jogada, autenticação e controle de versão. |
| Estrutura do banco | `db/schema.ts` e `drizzle/` | Use novas migrações ao alterar o esquema. |
| Publicação e banco | `wrangler.json` | Nome do Worker, vínculo `DB`, nome e ID do banco. |

### Exemplos de alterações

- Para trocar a cor principal, procure `--green` em `src/style.css` e altere o valor efetivo para outra cor CSS, como `#65449a`.
- Para reescrever uma regra, procure o título do jogo em `src/catalog.mjs` e edite o texto de `rules`, preservando aspas e vírgulas.
- Para mudar os créditos, edite `credits()` em `src/client.mjs` e o rodapé de `src/index.html`. Atualize também `TERMOS_DE_USO.md` se as condições de uso mudarem.

## Formato das variantes

| Jogo / ID | Formato de cada variante | Limites recomendados para manter esta interface |
| --- | --- | --- |
| Aproximação / `0` | Inteiro: comprimento da tira | Pelo menos 3 casas; use dimensões pequenas para a tela. |
| Duas pilhas / `1` | Par `[pilhaA, pilhaB]` | Quantidades não negativas, com soma positiva; até 100 por pilha. |
| Potências primas / `2` | Inteiro: quantidade inicial | Quantidade positiva; mantenha valores moderados. |
| Até a metade / `3` | Inteiro: quantidade inicial | Pelo menos 2. |
| Maioria / `4` | Inteiro: lado do tabuleiro | Ímpar; prefira 3, 5, 7 ou 9. |
| Divisão / `5` | Inteiro: moedas iniciais | De 2 a 2026 para usar os controles atuais. |
| Territórios / `6` | Inteiro: lado do tabuleiro | Prefira 6 a 12 para a tela. |
| Paridade / `7` | `2` ou `3` | São os dois modos implementados. |
| Último ponto / `9` | Inteiro: quantidade inicial | Quantidade positiva. |

O campo `id` identifica cada implementação e não deve ser renumerado apenas para mudar a ordem do menu. Adicionar outro tipo de jogo exige implementar regras no motor, controles na interface e testes; não basta adicionar um título.

**Mantenha a coerência matemática:** se alterar o número de objetos retirados por turno, o tamanho/paridade do tabuleiro ou as condições de vitória, revise também a explicação da estratégia.

## Edição no computador

```bash
git pull origin main
npm ci
npm run dev
```

Abra o endereço local exibido no terminal. O D1 local é separado do banco de produção. Depois de editar:

```bash
npm test
npm run build
npm run validate
git add src
git commit -m "Descrever a alteração"
git push origin main
```

Se alterou outros arquivos além de `src`, adicione-os também ao commit. Caso a publicação automática ainda não esteja configurada, siga `PUBLICAR_CLOUDFLARE.md`.

Não edite `worker/index.js` nem `dist/`: são arquivos gerados e serão sobrescritos no próximo build. O código da interface está em `src/`.
