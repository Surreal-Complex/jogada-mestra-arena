# Publicar a Arena na sua Cloudflare

Este guia publica uma **cópia independente**. Os sites atuais continuam funcionando. Você controla o novo código, servidor e banco na sua própria conta.

## 1. Preparar o computador

Crie ou utilize sua conta na [Cloudflare](https://dash.cloudflare.com/). Instale [Node.js](https://nodejs.org/) 22.13 ou superior e [Git](https://git-scm.com/). No Windows, os comandos abaixo podem ser executados no PowerShell ou terminal do VS Code.

```bash
git clone https://github.com/Surreal-Complex/jogada-mestra-arena.git
cd jogada-mestra-arena
npm ci
npx wrangler login
```

O último comando abre o navegador para autenticação. Entre na **sua** conta Cloudflare e conclua o acesso solicitado pelo Wrangler.

## 2. Criar seu banco de dados

```bash
npx wrangler d1 create jogada-mestra-arena-db
```

Anote o `database_id` retornado. Se o Wrangler oferecer editar a configuração automaticamente, confira o resultado para não duplicar a entrada do banco.

Abra `wrangler.json` e substitua somente o ID de zeros pelo ID recebido. Mantenha uma única entrada com:

```json
{
  "binding": "DB",
  "database_name": "jogada-mestra-arena-db",
  "database_id": "COLE_AQUI_O_ID_REAL_DO_SEU_BANCO",
  "migrations_dir": "drizzle"
}
```

`DB` é o nome que o código usa para acessar o banco; mantenha exatamente esse valor. A configuração completa, com nome do Worker e demais campos, já está no repositório. O ID do banco não é senha nem token.

## 3. Verificar e publicar a primeira versão

```bash
npm test
npm run deploy:all
```

O comando de publicação gera o Worker, cria a tabela das salas por migração e envia o site à Cloudflare. Confira os prompts e a conta escolhida; se você tiver várias contas, selecione aquela em que criou o D1.

O terminal exibirá o endereço público `workers.dev` atribuído pela Cloudflare. Esse é o novo endereço para seus alunos. Não é necessário comprar um domínio.

### Conferir o resultado

- Abra o endereço publicado e escolha um jogo.
- Crie uma sala e copie o convite.
- Abra o convite em outro dispositivo ou em uma janela anônima.
- Faça uma jogada em cada lado e confira a alternância.
- Confira a aba “Autoria e uso”. A referência de citação usa automaticamente o endereço em que a cópia está aberta.

## 4. Guardar a configuração no GitHub

Salve o `wrangler.json` atualizado no repositório. Você pode usar o VS Code ou:

```bash
git add wrangler.json
git commit -m "Configurar banco D1 da minha Cloudflare"
git push origin main
```

Use a autenticação normal do GitHub caso seja solicitada. Não inclua senhas ou tokens no arquivo.

## 5. Ativar publicação automática após suas edições

No painel Cloudflare:

1. Entre em **Workers & Pages** e abra o Worker **jogada-mestra-arena**, criado na etapa 3.
2. Em **Settings → Builds**, conecte o repositório **Surreal-Complex/jogada-mestra-arena**. Autorize o acesso a esse repositório quando solicitado.
3. Configure:

| Campo | Valor |
| --- | --- |
| Branch de produção | `main` |
| Diretório raiz | raiz do repositório |
| Comando de build | `npm run build && npm run validate` |
| Comando de deploy | `npm run deploy` |
| Nome do Worker | `jogada-mestra-arena` |

O nome do Worker deve ser igual ao campo `name` de `wrangler.json`. Se precisar definir a versão do Node no ambiente de build, use `NODE_VERSION` com uma versão suportada de Node.js 22.13 ou superior.

Depois disso, salvar uma alteração em `main` no GitHub inicia uma nova publicação. Acompanhe o resultado no histórico de builds da Cloudflare.

**Alterações de banco são um caso separado:** o deploy automático acima não aplica migrações. Edições de textos, cores e regras normalmente não precisam delas. Se alterar `db/schema.ts`, gere uma nova migração, revise o SQL, aplique-a ao banco remoto e então publique o código que depende dela:

```bash
npm run db:generate
npm run db:remote
```

Não edite migrações já aplicadas. Guarde as novas migrações no GitHub junto com a alteração de esquema.

## Quando algo não funcionar

| Sintoma | O que conferir |
| --- | --- |
| Mensagem pedindo `database_id` | Substitua o exemplo de zeros em `wrangler.json` pelo ID real. |
| Site abre, mas criar sala falha | Confira o vínculo D1 `DB` e execute `npm run db:remote` na conta correta. |
| Mensagem sobre tabela `rooms` ausente | As migrações ainda não foram aplicadas ao banco remoto. |
| Cloudflare não publica após salvar no GitHub | Confira a branch `main`, a conexão do repositório e os registros de build. |
| Nome do Worker não corresponde | Ajuste o nome no painel ou em `wrangler.json` para que sejam iguais. |
| Convite diz que a sala está cheia | Use dois dispositivos/navegadores distintos. A mesma aba guarda a identidade de quem entrou. |
| Sala deixou de abrir | As salas expiram após 24 horas; crie outra. |

Consulte os limites do seu plano na Cloudflare. As consultas periódicas das salas consomem requisições e leituras D1; acompanhe o uso conforme a quantidade de alunos. Os textos dos cadernos ficam no navegador de cada estudante e não migram entre endereços.

## Documentação oficial consultada

- [Primeiros passos com D1](https://developers.cloudflare.com/d1/get-started/)
- [Migrações do D1](https://developers.cloudflare.com/d1/reference/migrations/)
- [Publicação integrada ao GitHub](https://developers.cloudflare.com/workers/ci-cd/builds/)
