# mesa-ims-backend

## Descrição

API do sistema IMS (Integrated Management System, ou Sistema de Gestão Georreferenciada Integrada)

## Tecnologias

- NestJS (versão 8.0.0)
  - NestJS é uma framework que roda sobre o Node.js
- MongoDB (versão 5.0)
  - Recomenda-se o uso do MongoDB Cloud para criar instâncias do banco de dados
- Envio de e-mails usando protocolo SMTP
- Testes com Jest (versão 27.2.5)
- Heroku para ambiente de deploy
  - Outros serviços podem ser utilizados caso desejado

## Instalação rápida

1. Criar uma instância de banco de dados MongoDB usando [o serviço em nuvem da Atlas](https://www.mongodb.com/atlas/database)
2. Instalar o [Node](https://nodejs.org/en/) na máquina
3. Clonar o repositório
4. Rodar o comando `npm install` para baixar as dependências
5. Copiar o arquivo `.env.example` o renomeando para `.env` e alterar os valores das variáveis de acordo com o ambiente de instalação (apontando para a instância criada no passo 1)

## Variáveis de ambiente

| Nome | Descrição | Valores |
| - | - | - |
| NODE_ENV | Tipo de ambiente no qual a API irá rodar. Afeta algumas funções, como permitir chamadas para serviços externos e testes | - development (para desenvolvimento local)<br />- test (usado quando os testes rodam)<br />- production (usado em servidor real de produção) |
| PORT | Porta da máquina na qual a API irá rodar | Número da porta não utilizada na máquina (3000, 3333...). Em servidores de produção normalmente o valor é preenchido automaticamente |
| SECRET_KEY | Chave usada para gerar um token JWT reconhecido pela API. Não compartilhar com outras pessoas, pois pode ser usada para falsificar tokens | Valor alfanumérico. Recomendado no mínimo 32 caracteres |
| JWT_EXPIRATION | Data de duração dos tokens JWT. Segundos ou string representando um período de tempo | - 86400 (24 horas em segundos)<br />- 1d (um dia)<br />- 12h (doze horas)<br />- ... |
| GOOGLE_CLIENT_ID | ID do aplicativo Google usado para os processos de SSO | Valor alfanumérico obtido no painel da aplicação no Google Cloud |
| MONGO_DATABASE_URL | URL de conexão com o banco de dados MongoDB para uso da aplicação no [formato de conexão específico](https://docs.mongodb.com/manual/reference/connection-string/) | - mongodb://&lt;host> <br />- mongodb+srv://&lt;username>:&lt;password>@&lt;host>/&lt;database>?&lt;options> <br />- ... |
| MONGO_DATABASE_TEST_URL | URL de conexão com o banco de dados do MongoDB para os testes da API no mesmo formato acima. <u>**Deve ser um banco diferente do usado pela API!**</u> | - mongodb://&lt;host> <br />- mongodb+srv://&lt;username>:&lt;password>@&lt;host>/&lt;database>?&lt;options> <br />- ... |
| PASSWORD_RESET_URL | Prefixo da URL do frontend que leva à tela de recadastro de senha. Será incluída no e-mail do fluxo de "esqueci minha senha" | - Exemplo: https&#x3A;//ims-frontend/forgot-password |
| SMTP_HOST | Host do servidor SMTP usado para enviar e-mail | - Exemplo: smtp.host.io |
| SMTP_PORT | Porta do servidor SMTP usado para enviar e-mail | Servidores SMTP costumam usar a porta 587 como padrão, e aceitar também 25, 465 ou 2525 |
| SMTP_USER | Nome de usuário do servidor SMTP | String |
| SMTP_PASS | Senha do usuário do servidor SMTP | String |
| SMTP_FROM | Endereço de e-mail do remetente. Será usado para todos os e-mails enviados pela API | Endereço de e-mail. Exemplo: [naoresponda@email.com](mailto:naoresponda@email.com) |

## Comandos

A lista completa de comandos se encontra no arquivo `package.json`.

```bash
# instalar dependências
npm install

# iniciar em modo desenvolvimento
npm run start:dev

# fazer o build do projeto (gera pasta dist)
npm run build

# iniciar em modo produção (roda o que foi gerado em dist)
npm run start:prod

# roda todos os testes
npm run test

# rodar teste de arquivo específico
npm run test 'user.controller' # roda os testes de user.controller.spec.ts
```

## Estrutura

A API usa o padrão de repositório (repository pattern) com serviços e controladores.
- Controllers: tradução dos dados recebidos pelo frontend e formatação da resposta antes de enviar de volta
- Services: controlar as regras de negócio do sistema
- Repository: comunicação com a base de dados

## Testes

Os testes da API são funcionais. Nesse tipo de teste é feito o mínimo possível de mocks, favorecendo uma abordagem de comunicação com o banco de dados para simular com a maior exatidão possível um ambiente real.
É necessário que exista uma base de dados só para os testes, e ela <u>**NÃO PODE SER a mesma base de dados usada pela aplicação**</u>. Dados são inseridos e limpos durante os testes, e isso comprometeria a base de dados real do sistema.

## Documentação das rotas

A documentação das rotas com exemplos foi feita com o Postman e pode ser acessada [aqui](https://documenter.getpostman.com/view/18541861/UVRAGmRo).

## Deploy com o Heroku

O arquivo `Procfile` contém o comando que o Heroku irá rodar para iniciar a API. O comando, e por consequência a API, será rodado em um worker do tipo `web`.
O comando possui as flags `--optimize_for_size --max_old_space_size=460` para evitar que a memória estoure caso a API execute rotinas pesadas, tal como a integração automática com as bases de dados de Licenciamento Ambiental e Urbanístico.
O deploy é feito via Github Actions, pelos arquivos na pasta `.github/workflows`

## Branches

- main: branch principal de desenvolvimento. Todos os branches de feature devem ser feitos a partir dela
  - será feito deploy no ambiente de desenvolvimento sempre que houver push feito nessa branch
- staging: branch para fazer deploy no ambiente de staging. Não desenvolver diretamente nela
- release: branch para fazer deploy no ambiente de produção. Não desenvolver diretamente nela

## Conversor de dados

Dentro da pasta `shapefileConverter` há um sub projeto com scripts que convertem arquivos shapefiles em arquivos GeoJSONs e também convertem um tipo de coordenada geográfica em outro (por exemplo, de EPSG:31985 para 4326). Isso foi usado no início do projeto para converter as áreas do Parque Capibaribe e não influencia no resto do código da API, mas está incluso no repositório caso novas conversões sejam necessárias.

## License

Nest is [MIT licensed](LICENSE).
