# Jogada Mestra Arena

**Nove jogos matemáticos PvP, com salas on-line e modo local.** Código independente para edição e hospedagem na conta Cloudflare de Peterson L. N. Silva.

## Comece aqui

1. **[Publicar na sua Cloudflare](PUBLICAR_CLOUDFLARE.md)** — criar o banco D1, publicar o servidor e conectar atualizações automáticas ao GitHub.
2. **[Editar o site por conta própria](COMO_EDITAR.md)** — mapa dos arquivos, exemplos e roteiro de edição pelo GitHub ou VS Code.
3. **[Autoria, uso educacional e IA](TERMOS_DE_USO.md)** — créditos e condições de uso.

Este repositório está preparado para publicação, mas **a conta Cloudflare e o banco de produção ainda precisam ser configurados por você**. O identificador de banco em `wrangler.json` é um exemplo de zeros; substitua pelo ID do seu D1. As salas só funcionarão no novo endereço depois dessa configuração.

O site original e a Arena já publicada continuam sem alterações. Esta cópia usa um banco novo: não transfere salas, tokens ou cadernos dos outros endereços.

## Onde editar

| Objetivo | Arquivo |
| --- | --- |
| Cores, fontes e layout | `src/style.css` |
| Títulos, regras, pistas e variantes | `src/catalog.mjs` |
| Telas, botões e seção de autoria | `src/client.mjs` |
| Cabeçalho, rodapé e descrição do site | `src/index.html` |
| Regras e condições de vitória | `src/engine.mjs` |
| Servidor e endpoints das salas | `src/api.mjs` |
| Nome de publicação e banco D1 | `wrangler.json` |

## Recursos preservados

- Nove jogos de duas pessoas: aproximação, duas pilhas, potências primas, metade, maioria, divisão de pilhas, territórios, paridade e último ponto.
- Convites por link ou código; limite de dois participantes por sala; validade de 24 horas.
- Validação de jogadas no servidor e comparação de versão para impedir conflitos.
- Escolhas da paridade ocultas até a confirmação de ambos.
- Caderno individual salvo no navegador e exportável em TXT.
- Interface responsiva, regras e pistas recolhíveis; créditos e declaração de uso de IA.

## Comandos

Use Node.js 22.13 ou superior.

```bash
npm ci
npm test
npm run build
npm run validate
```

Com as dependências instaladas, `npm run dev` prepara o banco **local** e abre o servidor de desenvolvimento. Para publicar, siga o guia; `npm run deploy:all` gera o site, aplica migrações ao seu banco remoto e publica o Worker.

`worker/index.js` e `dist/` são gerados automaticamente. Edite os arquivos em `src/`. O GitHub Pages não executa as salas desta versão; use Cloudflare Workers + D1.

## Autoria

Concepção e organização: **Peterson L. N. Silva**, 2026. Desenvolvimento com apoio do **ChatGPT (OpenAI), por meio do Codex**. Acesso educacional gratuito; demais permissões descritas em [TERMOS_DE_USO.md](TERMOS_DE_USO.md).
