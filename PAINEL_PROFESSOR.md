# Ativar e usar o painel do professor

O código do painel está incluído nesta versão. Para ativá-lo na Cloudflare em que a Arena foi publicada, são necessários **o SQL das novas tabelas e um segredo de acesso**. Sem essa ativação, as partidas livres continuam funcionando e o painel explica que está pendente de configuração.

## 1. Criar as tabelas e o histórico automático no D1

No painel Cloudflare, abra o banco `jogada-mestra-arena-db` e seu Console SQL.

Abra o arquivo [drizzle/0001_friendly_otto_octavius.sql](drizzle/0001_friendly_otto_octavius.sql), copie o SQL completo e execute no console. Se o console não aceitar vários comandos juntos, execute cada bloco separado por `--> statement-breakpoint`, mantendo os blocos `CREATE TRIGGER ... BEGIN ... END` inteiros.

O arquivo cria cinco tabelas e dois gatilhos de histórico. Não apaga ou altera as partidas existentes. Os comandos têm `IF NOT EXISTS`, permitindo executar novamente se necessário.

**Não execute o arquivo 0000 outra vez neste banco:** a tabela `rooms` já foi criada durante a primeira instalação pelo console.

Para instalações futuras por Wrangler, use migrações normais. Neste banco inicializado manualmente, mantenha o controle de quais arquivos foram executados no console e não aplique a sequência inteira por CLI sem antes registrar esse estado de migração.

## 2. Definir a senha do professor como segredo

Abra **Workers & Pages → jogada-mestra-arena → Settings → Variables and Secrets → Add**.

| Campo | Preencher |
| --- | --- |
| Tipo | **Secret** (segredo), e não variável de texto comum |
| Nome | `TEACHER_PASSWORD` |
| Valor | Uma senha exclusiva, com pelo menos 16 caracteres, escolhida por você |

Salve e publique a alteração no Worker quando solicitado. Não coloque a senha no GitHub, em arquivos públicos, no caderno dos alunos ou nesta conversa. A senha não deve ser compartilhada com os estudantes.

Se você trocar esse segredo, as sessões anteriores deixam de ser válidas. O site não fornece uma senha padrão nem permite criar um administrador pelo acesso público.

## 3. Entrar e criar uma atividade

1. Abra a Arena e clique em **Painel do professor** no menu, ou acrescente `/#professor` ao endereço do site.
2. Entre com a senha escolhida. A sessão dura até 8 horas; use **Sair** em computadores compartilhados.
3. Crie uma atividade com título, por exemplo, “Estratégias — turma A”. Evite dados pessoais no título.
4. Copie o código de atividade, com **8 caracteres**, e passe aos alunos.

O código da atividade não é a senha do professor. O convite de sala tem **10 caracteres** e é compartilhado apenas entre os dois participantes.

## 4. Orientar os alunos

O aluno escolhe um jogo e clica em **Criar sala on-line**. No formulário, informa um **apelido ou primeiro nome**, o código da atividade e confirma que leu o aviso de compartilhamento. Depois, envia o convite da sala ao adversário.

O segundo participante também informa um apelido e confirma o aviso ao entrar. Não são solicitados e-mail, telefone ou uma conta de aluno. Os apelidos são autodeclarados; o site não verifica identidades nem impede que duas pessoas usem o mesmo apelido.

Partidas criadas sem código são **livres** e não aparecem no painel do professor. Partidas antigas não ganham acompanhamento retroativo nem identificação retroativa.

## 5. Acompanhar partidas e cadernos

No painel, selecione a atividade e clique em **Acompanhar** em uma sala.

- Consulte os dois apelidos, jogo, situação e número de cadernos entregues.
- Veja o tabuleiro em modo espectador, com atualização aproximadamente a cada três segundos.
- O professor não pode jogar pelos participantes nem modificar resultados pelo painel.
- No jogo de paridade, os números secretos só são mostrados depois que ambos confirmarem. Isso também vale para os registros históricos mostrados no painel.
- O histórico tem registros desde a criação da sala vinculada; use **Carregar registros anteriores** para avançar além dos 50 registros recentes da página.
- Depois de 24 horas, o convite da sala expira, mas o professor continua podendo consultar os registros da atividade.

No caderno da sala, cada aluno clica em **Entregar caderno ao professor**. Apenas esse clique envia os textos de raciocínio e estratégias. Digitar ou exportar para TXT não realiza uma entrega ao professor. O aluno pode reenviar: a entrega anterior daquela vaga é atualizada. Entregue antes da sala expirar.

O professor pode baixar JSON com a sala, os cadernos e os registros históricos carregados na tela. Para uma exportação com todos os registros, carregue primeiro todas as páginas do histórico.

## Dados e conservação

Nas atividades, o banco armazena apelidos, associação da sala à atividade, estados e resultados do jogo, registros de jogadas e textos entregues. O painel requer autenticação do professor e não possui listagem pública de alunos ou cadernos. Partidas livres ficam fora da listagem do professor.

Os cadernos não entregues permanecem no navegador do estudante. Cadernos enviados e históricos da atividade permanecem no D1 até remoção pelo responsável pelo projeto; a expiração de sala não representa exclusão desses registros. Esta versão não implementa exclusão pelo painel, recuperação de senha ou contas individuais de professores. O responsável deve organizar a conservação e remoção dos dados no D1 conforme a necessidade da atividade.

## Segurança implementada e limites

- Senha em segredo do Worker; nada de senha padrão no repositório.
- Cookie de sessão assinado, `HttpOnly`, `Secure`, `SameSite=Strict`, com validade de 8 horas.
- Bloqueio de novas tentativas por 15 minutos depois de 8 erros de senha por origem de rede; somente um identificador derivado é guardado, não o IP em texto.
- Entregas exigem o token da vaga ocupada e recebem o apelido correspondente no servidor.
- Histórico registrado por gatilhos do banco na mesma transação da jogada.
- Consultas SQL parametrizadas; conteúdo dos alunos escapado ao exibir.

O código possui testes automatizados de autenticação, atividades, entregas, paginação, sigilo das escolhas e compatibilidade com o banco anterior. Não há atribuição automática de notas ou decisão sobre alunos.

Documentação oficial sobre segredos: https://developers.cloudflare.com/workers/configuration/secrets/
