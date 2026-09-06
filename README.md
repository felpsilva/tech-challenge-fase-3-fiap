# Blog Educacional — Tech Challenge FIAP

Aplicação de blog educacional composta por **API (Fastify + TypeORM)** e
**interface web (Next.js 16 + React 19)**, com **PostgreSQL no Neon (remoto)**,
orquestrada com Docker Compose.

A documentação está dividida em duas partes independentes. Quem for mexer só em
um dos lados pode ler a visão geral e pular direto para a parte que interessa:

- **[Parte 1 — Backend](#parte-1--backend)** · API Fastify, banco, autenticação,
  rotas e deploy da API.
- **[Parte 2 — Frontend](#parte-2--frontend)** · arquitetura Next.js, tecnologias,
  interfaces criadas e integração com a API em local e produção.

A [Visão geral](#visão-geral) abaixo cobre só o que é comum aos dois: containers,
mecânica do `.env` compartilhado e como subir tudo de uma vez.

---

## Visão geral

### Arquitetura — separação de containers

O projeto usa **3 containers**, cada um com uma responsabilidade única:

| Container   | Imagem              | Papel                                                         | Porta (host) |
| ----------- | ------------------- | ------------------------------------------------------------- | ------------ |
| `neon-init` | `postgres:16-alpine`| Bootstrap idempotente do schema/seed no Neon via `db/init.sql`| -            |
| `backend`   | build `./backend`   | API REST — regras de negócio e acesso ao Neon                 | 3001         |
| `frontend`  | build `./frontend`  | Interface web (Next.js App Router)                            | 3000         |

#### Por que essa separação faz sentido neste contexto?

- **Banco gerenciado no Neon.** Não há container local de banco para manter.
- **Bootstrap automático.** O container `neon-init` aplica `db/init.sql` antes
  do backend subir, evitando erro de tabela inexistente em ambiente novo.
- **Front e API separados.** O navegador fala direto com a API, sem camada de
  proxy no meio. O preço dessa escolha é explícito: o CORS passa a ser
  configuração obrigatória do backend (`CORS_ORIGIN`) e o frontend precisa de
  duas URLs da API — uma para o navegador, outra para o próprio servidor do
  Next dentro da rede do compose. Veja
  [Duas URLs, dois caminhos](#duas-urls-dois-caminhos).

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│ neon-init  │─────> │  backend   │ <──── │  frontend  │
│ aplica SQL │       │  Fastify   │       │  Next.js   │
└────────────┘       │  :3001     │       │  :3000     │
         ^           └────────────┘       └────────────┘
         └──────> Neon PostgreSQL remoto
```

### Como subir a aplicação

Pré-requisito: Docker + Docker Compose.

```bash
docker compose up --build
```

Acesse:

- **Interface:** http://localhost:3000
- **API:** http://localhost:3001

Para rodar em segundo plano: `docker compose up --build -d`
Para derrubar: `docker compose down`.

### Configuração (`.env` na raiz)

Backend e frontend leem **o mesmo** arquivo, versionado na raiz do repositório:

| Arquivo | Quando é lido | O que contém |
| --- | --- | --- |
| `.env` | sempre | configuração de desenvolvimento: banco, JWT, CORS e as URLs da API em `localhost` |
| `.env.production` | quando `NODE_ENV=production` | só o que muda em produção — hoje a URL da API no Render |
| `.env.example` | nunca (é modelo) | template para quem clona o projeto |

Cada pacote sobe a árvore de diretórios até achar esses arquivos
(`backend/src/env/load-env-files.ts` e `frontend/src/lib/env/load-root-env.ts`).
A busca **para no diretório que contém `.git`**: sem esse limite, um `.env`
esquecido no home do usuário entraria na configuração do build.

Precedência, do mais forte para o mais fraco:

1. variável já exportada no ambiente (`environment` do compose, `env` do
   workflow, painel do Render);
2. `.env.<NODE_ENV>` da raiz;
3. `.env` da raiz.

É por isso que o compose consegue trocar `CORS_ORIGIN` e `API_URL` sem editar
arquivo nenhum, e o painel do Render continua sendo a fonte dos segredos de
produção.

Quais variáveis cada lado consome está documentado na parte respectiva:
[backend](#configuração-do-backend) e [frontend](#duas-urls-dois-caminhos). O modelo
completo está em `.env.example`.

O `.env` é versionado por decisão do projeto (trabalho acadêmico, avaliador
precisa subir sem configurar nada). Em um projeto real as credenciais do banco
e o `JWT_SECRET` não deveriam estar aqui.

### Estrutura do repositório

```
.
├── .env, .env.production, .env.example   # configuração compartilhada
├── package.json                          # scripts que delegam para os pacotes
└── blog-educacional/
    ├── docker-compose.yml                # orquestra neon-init + backend + frontend
    ├── db/init.sql                       # schema + seed
    ├── backend/                          # API Fastify + TypeORM (Dockerfile single-stage)
    └── frontend/                         # Next.js 16 App Router (Dockerfile multi-stage)
```

### Testes

Da raiz:

```bash
npm test          # roda as duas suítes
npm run test:back # jest --runInBand no backend
npm run test:front
```

Backend e frontend usam **Jest**, mas com configurações distintas — o detalhe de
cada suíte está em [Testes do backend](#testes-do-backend) e
[Testes do frontend](#testes-do-frontend).

### Publicação das imagens

O workflow em `.github/workflows/main.yml` publica as duas imagens no Docker Hub
(`<usuário>/blog-educacional-backend` e `<usuário>/blog-educacional-frontend`).
O que muda entre as duas — e o que precisa ser ajustado depois de publicar — está
em [Backend em produção](#backend-em-produção) e
[Frontend em produção](#frontend-em-produção).

---

# Parte 1 — Backend

API REST em **Fastify 5** com **TypeORM** sobre PostgreSQL (Neon), escrita em
TypeScript e executada direto por `tsx` (sem etapa de build). Validação de
configuração com **zod**, autenticação com **@fastify/jwt**, upload com
**@fastify/multipart** e hash de senha com **bcryptjs**.

Diretório: `blog-educacional/backend/`.

## Como rodar o backend

Com Docker (junto com o resto): veja [Como subir a aplicação](#como-subir-a-aplicação).

Direto, sem container — a partir da raiz do repositório:

```bash
npm --prefix blog-educacional/backend ci
npm run start        # tsx src/server.ts
npm run start:dev    # tsx watch
```

O servidor só abre a porta depois do `DataSource` do TypeORM inicializar, para
não aceitar requisição antes do banco estar pronto.

## Configuração do backend

Variáveis lidas do `.env` da raiz e validadas por zod em `src/env/index.ts` — se
faltar alguma obrigatória, o processo **não sobe**:

| Variável | Obrigatória | Padrão | Papel |
| --- | --- | --- | --- |
| `NODE_ENV` | não | `development` | seleciona o `.env.<NODE_ENV>` complementar |
| `PORT` | não | `3001` | porta HTTP |
| `DATABASE_URL` | não | — | string de conexão completa (usada pelo `neon-init`) |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | **sim** | — | conexão do TypeORM |
| `JWT_SECRET` | **sim** | — | assinatura do token |
| `CORS_ORIGIN` | não | `http://localhost:3000` | origens liberadas, separadas por vírgula |

**A imagem do backend é construída a partir da raiz do repositório**, não de
`./backend`, justamente para conseguir copiar o `.env` compartilhado para dentro
dela (`COPY .env* ./` no Dockerfile). É o que permite ao serviço no Render subir
sem nenhuma variável configurada no painel. Continua sendo fallback: variável
definida no painel vence o arquivo embutido.

## Banco de dados e seed

Não há migrations: todo o schema vive em `db/init.sql`, aplicado de forma
idempotente pelo container `neon-init` a cada subida (`IF NOT EXISTS` e
`ON CONFLICT`). Coluna ou tabela nova precisa entrar lá com `IF NOT EXISTS`,
senão o `ON_ERROR_STOP=1` derruba o bootstrap na segunda execução.

O seed cria o usuário de demonstração:

- Usuário: **admin** · senha: **admin123** (permissão `admin`)

Para reaplicar o bootstrap: `docker compose up --build`.

## Guia de uso da API

### Base URL

- **Local:** http://localhost:3001
- **Produção:** https://blog-educacional-backend-1.onrender.com/

### Autenticação

A API usa JWT. Para acessar rotas protegidas, faça `POST /user/signin` e envie o
token retornado no header `Authorization` no formato:

```http
Authorization: Bearer <token>
```

O token carrega `id`, `username` e `permission`, e vale **1 hora** — não há
rota de refresh. O `id` está nas claims porque `POST /post` exige `user_id` no
corpo e `GET /user` é restrito a `admin`: sem ele, um professor não teria como
descobrir o próprio identificador e não conseguiria publicar.

### CORS

O backend só aceita requisições de navegador vindas das origens listadas em
`CORS_ORIGIN` (lista separada por vírgula; o padrão é `http://localhost:3000`).
Em produção, essa variável precisa apontar para a origem do frontend publicado
— caso contrário o navegador barra todas as chamadas.

Dois ajustes explícitos no plugin, ambos com motivo: os métodos são ampliados
além do padrão `GET,HEAD,POST` (senão o preflight de `PUT`/`DELETE` é recusado)
e o `Content-Disposition` é exposto (não é safelisted; sem expor, o navegador
não lê o filename da thumbnail).

### Perfis de acesso

- **visitante anônimo** (sem token): lê os posts **publicados** e as imagens deles.
- `aluno`: o mesmo do visitante, com conta.
- `professor`: pode criar, listar, atualizar e remover categorias e posts.
- `admin`: acesso administrativo completo, incluindo a gestão de usuários.

### Rotas

| Método e rota | Acesso |
| --- | --- |
| `POST /user/signin` | público — autentica e retorna o token JWT |
| `POST /user` | `admin` |
| `GET /user` · `GET /user/:id` | `admin` |
| `PUT /user/:id` · `DELETE /user/:id` | `admin` |
| `POST /category` | `admin`, `professor` |
| `GET /category` · `GET /category/:id` | `admin`, `professor` |
| `PUT /category/:id` · `DELETE /category/:id` | `admin`, `professor` |
| `POST /post` | `admin`, `professor` |
| `GET /post` · `GET /post/search?q=` · `GET /post/:id` | **público** |
| `PUT /post/:id` | `admin`, `professor` — aceita `categories`, o que permite trocar a categoria de um post já criado |
| `DELETE /post/:id` | `admin`, `professor` |
| `POST /post/:id/thumbnail` | `admin`, `professor` — `multipart/form-data` |
| `GET /post/:id/thumbnail` | **público** — uma tag `<img>` do navegador não envia header `Authorization` |
| `DELETE /post/:id/thumbnail` | `admin`, `professor` |

A lista de rotas públicas está declarada em `src/http/middlewares/jwt-validate.ts`
e precisa ser mantida em sincronia com o registro das rotas em
`src/http/controllers/post/routes.ts`.

#### O que "público" significa aqui

As rotas de leitura de post respondem sem token, mas **rascunho não é conteúdo
publicado**: sem um token válido, `GET /post` e `GET /post/search` devolvem só
os itens com `status: 'published'`, e `GET /post/:id` de um rascunho responde
`404` (e não `403`, que já confirmaria a existência do post). Com token, o
autor continua vendo os próprios rascunhos.

O middleware faz *soft verify* nessas rotas: token válido é aproveitado (o
controller usa `request.user` para decidir se mostra rascunho), token ausente ou
expirado não bloqueia.

Duas consequências que ficam registradas por honestidade, não escondidas:

- O payload do post embute a relação `user`, então `id`, `username`,
  `permission` e `created_at` do autor ficam visíveis publicamente. O hash de
  senha **não** — a coluna tem `select: false`, travado por teste. Se o
  vazamento do papel/username incomodar, o conserto é projetar `{ id, username }`
  nos três controllers de leitura.
- `GET /post/:id/thumbnail` não checa o status do post. Um rascunho com imagem
  tem o binário acessível por quem souber o id. Filtrar exigiria uma consulta
  extra ao post em toda requisição de imagem da home; o texto do rascunho segue
  protegido.

### Exemplos de payload

#### POST /user/signin

```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST /user

```json
{
  "username": "admin",
  "password": "admin123",
  "permission": "admin"
}
```

#### POST /category

```json
{
  "name": "Matemática",
  "slug": "matematica"
}
```

#### POST /post

```json
{
  "user_id": 1,
  "title": "Primeiro post",
  "slug": "primeiro-post",
  "content": "Conteúdo de exemplo da publicação.",
  "image_url": "https://exemplo.com/imagem.png",
  "status": "published",
  "categories": [
    {
      "id": 1,
      "name": "Matemática",
      "slug": "matematica"
    }
  ]
}
```

#### PUT /post/:id

```json
{
  "title": "Primeiro post revisado",
  "status": "published",
  "categories": [{ "id": 2 }]
}
```

Sobre `categories` no update: **omitir a chave não mexe** nas categorias do
post; mandar `[]` **remove todas**; mandar `[{ "id": N }]` substitui pelo
conjunto informado. Só o `id` é considerado — o backend resolve as entidades.

### Thumbnail do post (upload de arquivo)

Além do `image_url` (imagem hospedada fora), o post aceita o **upload do arquivo**
em si. O binário fica na tabela `post_images`, em relação 1:1 com `posts`.

Por que uma tabela separada: as listagens (`GET /post`, `GET /post/search`) fazem
`SELECT` de todas as colunas de `posts`. Com o binário ali dentro, cada listagem
arrastaria todas as imagens do Neon até a API. Em tabela própria, e com a coluna
`data` marcada como `select: false` no TypeORM, o binário só sai do banco na rota
que efetivamente entrega o arquivo.

Regras aplicadas no upload:

- Formatos aceitos: **JPEG, PNG e WebP** — validados pelos primeiros bytes do
  arquivo, não pelo `Content-Type` declarado pelo cliente.
- Tamanho máximo: **2 MB** por arquivo (`413` acima disso).
- Um post tem no máximo uma thumbnail: um novo upload substitui a anterior.
- Apagar o post apaga a thumbnail junto (`ON DELETE CASCADE`).

O `POST` devolve só os metadados; o binário é servido pelo `GET`, cru, com o
`Content-Type` da imagem — nunca embutido no JSON do post.

```json
{
  "post_id": 1,
  "filename": "capa.png",
  "mime_type": "image/png",
  "size_bytes": 48231,
  "created_at": "2026-08-31T12:00:00.000Z",
  "updated_at": "2026-08-31T12:00:00.000Z"
}
```

Limite prático de armazenamento: o plano free do Neon oferece ~0,5 GB. Com
thumbnails reais (150–300 KB), isso comporta algo entre 1.500 e 3.000 posts com
imagem. Para volume maior, o caminho é trocar a coluna `data` por uma chave de
object storage (S3/R2), mantendo as mesmas três rotas.

### Exemplos de chamada

```bash
curl -X POST http://localhost:3001/user/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

```bash
curl -X POST http://localhost:3001/category \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Matemática","slug":"matematica"}'
```

```bash
curl -X POST http://localhost:3001/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"user_id":1,"title":"Primeiro post","slug":"primeiro-post","content":"Conteúdo de exemplo da publicação.","status":"published","categories":[{"id":1,"name":"Matemática","slug":"matematica"}]}'
```

```bash
# envia o arquivo da thumbnail do post 1
curl -X POST http://localhost:3001/post/1/thumbnail \
  -H "Authorization: Bearer <token>" \
  -F "file=@./capa.png"
```

```bash
# baixa a thumbnail do post 1
curl http://localhost:3001/post/1/thumbnail \
  -H "Authorization: Bearer <token>" \
  -o capa.png
```

## Mapa do código (backend)

```
src/
├── server.ts                 sobe o Fastify depois de inicializar o DataSource
├── app.ts                    plugins (cors, jwt, multipart), hook de auth, rotas
├── env/                      carregamento do .env da raiz + validação zod
├── entities/                 entidades TypeORM (user, post, category, post-image)
│   └── models/               interfaces dos modelos
├── repositories/             interfaces + implementações TypeORM
├── use-cases/                regras de negócio, uma por arquivo
│   ├── errors/               erros de domínio (not found, credenciais, imagem)
│   └── factory/              fábricas que injetam os repositórios nos use cases
├── http/
│   ├── controllers/          um diretório por recurso, com `routes.ts` próprio
│   └── middlewares/          jwt-validate (rotas públicas) e authorize-roles
├── lib/typeorm/              DataSource
├── utils/                    validação de imagem, status de post, error handler
└── test/                     setup do Jest e helpers (app autenticado, multipart)
```

Fluxo de uma requisição: `routes.ts` → `authorize-roles` → controller (valida o
corpo com zod) → factory → use case → repositório → TypeORM. Erros de domínio
sobem até o `global-error-handler`, que faz a tradução para o status HTTP.

## Testes do backend

```bash
npm run test:back   # da raiz — equivale a `jest --runInBand`
```

O `--runInBand` não é enfeite: as suítes de rota tocam o mesmo banco remoto, e
rodar em paralelo produziria interferência entre elas. Os helpers em
`src/test/helpers/` montam um app já autenticado e o corpo multipart do upload.

## Backend em produção

A API está publicada no Render, consumindo a imagem do backend publicada no
Docker Hub.

- **Imagem no Docker Hub:** https://hub.docker.com/repository/docker/fpsilva777/blog-educacional-backend/tags
- **URL da API em produção:** https://blog-educacional-backend-1.onrender.com/

O deploy é feito no GitHub, o workflow publica a imagem no Docker Hub, e o
Render puxa a imagem — porém o Render **não atualiza automaticamente**: é
preciso ir ao painel e clicar em "Manual Deploy".

Depois de publicar o frontend, ajuste `CORS_ORIGIN` no serviço do backend no
Render para a origem dele.

## Observações técnicas do backend

- O backend roda o TypeScript diretamente via `tsx` (sem etapa de build), e por
  isso seu Dockerfile é single-stage — diferente do frontend, que compila. A
  assimetria entre os dois Dockerfiles é intencional.
- Uploads vão para o banco, não para o disco: o container não tem volume e a
  imagem é recriada a cada deploy, então qualquer arquivo salvo no filesystem se
  perderia.
- O hash de senha nunca sai do banco: a coluna `password` da entidade `User`
  tem `select: false`, então nenhuma consulta o traz por engano — nem quando o
  usuário é carregado como relação (o autor em `GET /post`). O único ponto que
  pede a coluna explicitamente é o `findByUsername`, usado pelo `signin` para
  comparar o hash com o bcrypt.

---

# Parte 2 — Frontend

Interface web do blog: um site público de leitura de posts e um painel
administrativo para quem publica. Consome a API descrita na
[Parte 1](#parte-1--backend).

Diretório: `blog-educacional/frontend/` — esta mesma documentação está
espelhada no [README do frontend](blog-educacional/frontend/README.md).

## Arquitetura do frontend

**Next.js 16 com App Router**, usando os dois modos de renderização de forma
deliberada — cada um resolve um problema diferente:

| | Páginas públicas (`/`, `/posts/[id]`) | Painel (`/admin/*`, `/login`) |
| --- | --- | --- |
| Renderização | **Server Components** | **Client Components** (`'use client'`) |
| Quem chama a API | o **servidor** do Next, com `fetch` nativo | o **navegador**, com axios |
| Autenticação | nenhuma (rotas públicas da API) | token JWT no header `Authorization` |
| Por quê | conteúdo indexável, HTML pronto, cache de 60s | dados por usuário, formulários e interação |

```
                    ┌───────────────────────┐
   página pública    │   servidor do Next    │  fetch  ┌─────────────┐
 ──────────────────> │   (Server Component)  │ ──────> │             │
                     └───────────────────────┘         │   Backend   │
                                                       │   Fastify   │
   painel / login     ┌──────────────────────┐  axios  │   :3001     │
 ──────────────────>  │  navegador (React)   │ ──────> │             │
                      └──────────────────────┘         └─────────────┘
```

O código é organizado em camadas, da mais concreta para a mais genérica:

```
src/
├── app/          rotas do App Router — só montam a página e delegam
├── features/     regras de tela por domínio (posts, categories, users, auth)
├── components/   UI reutilizável, sem conhecer domínio
│   ├── layout/   cabeçalho, rodapé, navegação do painel, skip link
│   └── ui/       botão, campo de formulário, tabela, diálogo, paginação…
├── lib/
│   ├── api/      cliente HTTP, resolução das URLs, serviços por recurso
│   ├── auth/     cookie de sessão, decode do JWT, contexto de sessão
│   ├── env/      leitura do .env da raiz do repositório
│   ├── hooks/    debounce, paginação no cliente, recurso assíncrono, slug
│   └── utils/    slugify, resumo, formatação de data e bytes
├── styles/       tema, tokens, breakpoints, registry de SSR
├── types/        tipos da API e vocabulários (status, permissões)
└── proxy.ts      guarda de navegação de /admin/* e /login
```

A regra é sempre a mesma: **um arquivo em `app/` nunca chama a API direto**. Ele
monta o componente de `features/`, que usa um serviço de `lib/api/`. Isso deixa a
troca de cliente HTTP ou de rota da API restrita a uma camada.

## Tecnologias e como foram usadas

| Tecnologia | Onde e como é usada |
| --- | --- |
| **Next.js 16** (App Router) | Roteamento por arquivos, Server Components nas páginas públicas, `revalidate: 60` na home, `generateMetadata` no post, e `proxy.ts` como guarda de navegação (o antigo `middleware.ts`). |
| **React 19** | Componentes de tela; estado local com hooks e um `AuthContext` para a sessão. |
| **TypeScript** | Contratos da API em `types/api.ts`, compartilhados entre serviços, formulários e telas — o payload do backend é tipado num lugar só. |
| **styled-components 6** | Todo o CSS. Tokens (cor, espaço, raio, tipografia) ficam em `styles/theme.ts` e chegam aos componentes pelo `ThemeProvider`; `styles/media.ts` centraliza os breakpoints. O `styled-components-registry.tsx` injeta o CSS no SSR para não haver flash sem estilo. |
| **Formik** | Estado, submit e erros dos formulários de login, post e categoria. |
| **Yup** | Esquemas de validação dos mesmos formulários (`post-form-schema.ts`), rodando no cliente antes de chamar a API. |
| **axios** | Cliente do navegador (`lib/api/http-client.ts`), com interceptors: um injeta o `Authorization` a partir do cookie, outro normaliza o erro e derruba a sessão em `401`. |
| **Jest + Testing Library** | Testes de componente (`post-card`, `post-list`, `category-form`) e de unidade (`slugify`, `api-error`, `api-url`). O Jest vem via `next/jest`, que aplica as mesmas transformações SWC do build. |
| **ESLint** (`eslint-config-next`) | Lint; o `next lint` foi removido no Next 16, então o script chama o `eslint` direto. |

## Interfaces criadas

### Páginas

| Rota | Para que serve | Acesso | Renderização |
| --- | --- | --- | --- |
| `/` | Home: lista os posts **publicados** com título, autor e resumo de 2 linhas, com campo de busca e paginação | público | servidor |
| `/posts/[id]` | Leitura do post completo, com thumbnail e categorias | público | servidor |
| `/login` | Autentica e grava a sessão; redireciona para a página que o usuário tentou abrir | público | cliente |
| `/admin/posts` | Lista administrativa de posts (inclusive rascunhos), com editar e excluir | professor, admin | cliente |
| `/admin/posts/new` · `/admin/posts/[id]/edit` | Criar e editar post: título, slug, conteúdo, status, categorias e upload da thumbnail | professor, admin | cliente |
| `/admin/categories` | Lista administrativa de categorias, com editar e excluir | professor, admin | cliente |
| `/admin/categories/new` · `/admin/categories/[id]/edit` | Criar e editar categoria (nome e slug) | professor, admin | cliente |
| `/admin/users` | Gestão de usuários: trocar permissão e excluir | **admin** | cliente |
| `/sem-permissao` | Destino de quem está logado mas não tem o papel exigido | — | cliente |
| `/not-found` | 404 do App Router | — | servidor |

### Componentes de domínio (`features/`)

| Componente | Para que serve |
| --- | --- |
| `posts/post-list` · `post-card` | Grade da home; a busca filtra em memória e a paginação é no cliente |
| `posts/post-article` | Corpo do post na página de leitura |
| `posts/post-form` · `post-form-schema` · `post-image-field` | Formulário de post, validação Yup e campo de upload da thumbnail com pré-visualização |
| `posts/post-table` | Tabela administrativa de posts, com ações por linha |
| `posts/post-thumbnail` | `<img>` da thumbnail servida pela API |
| `categories/category-form` · `category-table` | Formulário e tabela de categorias |
| `users/user-table` | Tabela de usuários com troca de permissão |
| `auth/login-form` | Formulário de login; grava o cookie e redireciona |
| `auth/require-session` | Envolve as telas do painel e garante que a sessão existe no cliente |

### Primitivos de UI (`components/ui/`)

`button`, `form-field`, `form-error-summary`, `data-table`, `confirm-dialog`,
`pagination`, `feedback`, `badge`, `page-container`, `inputs`,
`visually-hidden`. São genéricos de propósito: nenhum conhece post, categoria ou
usuário. É o que permite que todos os formulários tenham o mesmo comportamento
de erro e todas as tabelas o mesmo comportamento responsivo.

## Integração com o backend

### Duas URLs, dois caminhos

A aplicação fala com a API por **dois caminhos distintos**, e cada um usa uma
variável de ambiente própria:

| Variável | Quem usa | Como é lida |
| --- | --- | --- |
| `API_URL` | o **servidor** do Next (Server Components, via `serverGet`) | em runtime, a cada requisição |
| `NEXT_PUBLIC_API_URL` | o **navegador** (axios e o `<img>` da thumbnail) | **embutida no bundle durante o build** |

Quem resolve isso é `lib/api/api-url.ts`: no servidor devolve `API_URL` (com
`NEXT_PUBLIC_API_URL` como fallback), no navegador devolve sempre
`NEXT_PUBLIC_API_URL`. O fallback final é `http://localhost:3001`.

**Uma variável só não atende os dois.** Dentro do Docker Compose o servidor do
Next alcança a API pelo DNS interno (`http://backend:3001`), mas o navegador do
usuário só alcança a porta publicada no host (`http://localhost:3001`). Apontar
`NEXT_PUBLIC_API_URL` para `http://backend:3001` gera um site em que o SSR
funciona e **toda** interação do cliente falha com erro de DNS.

### Ambiente local × produção

| | Local (`npm run dev`) | Local (Docker Compose) | Produção |
| --- | --- | --- | --- |
| `API_URL` | `http://localhost:3001` | `http://backend:3001` | `https://blog-educacional-backend-1.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | `http://localhost:3001` | `https://blog-educacional-backend-1.onrender.com` |
| Origem do valor | `.env` da raiz | `args` e `environment` do compose | `.env.production` da raiz, repassado como `build-args` no workflow |

Como `NEXT_PUBLIC_API_URL` entra no bundle em tempo de build, ela é `ARG` no
Dockerfile e `build-args` no workflow do GitHub — trocar o host da API em
produção **exige rebuild da imagem**, não basta mudar variável de ambiente.

Do outro lado, o backend precisa liberar a origem do frontend em `CORS_ORIGIN`:
como o navegador fala direto com a API (não há proxy no meio), sem isso todas as
chamadas do cliente são barradas.

### Leitura pública (servidor)

`lib/api/server-fetch.ts` usa o `fetch` nativo com o cache do Next
(`revalidate: 60`, tags) e **nunca lança**: devolve `{ ok: false, message }`.
O motivo é concreto — o `next build` pré-renderiza a home, e durante o
`docker build` a API não está no ar; uma exceção ali derrubaria a imagem
inteira. Na prática a página mostra um aviso e se recupera sozinha na primeira
revalidação.

### Chamadas autenticadas (navegador)

Os serviços em `lib/api/` (`post-service`, `category-service`, `user-service`,
`auth-service`) são funções finas sobre o `httpClient` do axios, uma por rota da
API. O fluxo de sessão:

1. `/login` chama `POST /user/signin` e recebe o token JWT.
2. `writeAuthToken` grava o cookie `blog_token` com `Max-Age` derivado do `exp`
   do próprio token — o navegador vira o cronômetro da sessão, já que a API não
   tem rota de refresh.
3. Todo request do axios passa por um interceptor que lê esse cookie e monta o
   header `Authorization: Bearer <token>`.
4. Resposta `401` limpa o cookie e dispara o handler de sessão expirada.

O cookie é **legível por JavaScript de propósito** (não é `httpOnly`): sem uma
camada de proxy no servidor, o axios precisa ler o token. Não há risco de CSRF,
porque o token vai num header montado à mão e o backend nem lê cookie.

A guarda em `proxy.ts` protege `/admin/*` e `/login` lendo as claims do cookie
**sem verificar assinatura** — o `JWT_SECRET` não pode ir para o bundle. Ela é
**navegação, não autorização**: quem forjar um cookie vê a casca do painel e
nenhum dado, porque toda requisição leva o token ao Fastify, que confere a
assinatura de verdade.

### Thumbnail

`buildThumbnailUrl` monta `GET /post/:id/thumbnail` sempre com a URL **pública**
da API, porque quem busca a imagem é a tag `<img>` do navegador — mesmo quando a
página foi renderizada no servidor. A URL leva `?v=<timestamp>`: um novo upload
troca os bytes na mesma URL e, sem isso, o navegador serviria a imagem antiga do
cache.

O upload usa `FormData` e o axios monta o `Content-Type` com o boundary do
multipart — por isso o cliente não fixa esse header.

## Decisões de interface

Quatro escolhas que fogem do padrão e têm motivo:

- **A busca filtra no cliente**, em vez de chamar `GET /post/search`. O `ILIKE`
  do backend é insensível a caixa mas **não a acento**: procurar "matematica"
  não acharia "Matemática". Como a API não pagina, a lista já está em memória.
- **A paginação também é no cliente**, pelo mesmo motivo: nenhuma listagem da
  API aceita `page`/`limit`.
- **`<img>` simples, não `next/image`.** O `image_url` do post é texto livre,
  então o conjunto de hosts para `images.remotePatterns` é desconhecido por
  definição; e o Next 16 bloqueia otimização de IP local, o que quebraria a
  thumbnail vinda de `localhost:3001` em desenvolvimento.
- **Resumo de duas linhas por CSS (`line-clamp`)**, não por corte de string:
  "duas linhas" depende da largura renderizada e da fonte carregada — cortar por
  contagem de caracteres daria duas linhas no desktop e quatro no celular.

## Como rodar o frontend

Com Docker (junto com o resto): veja [Como subir a aplicação](#como-subir-a-aplicação).

Direto, a partir da raiz do repositório (a API precisa estar no ar):

```bash
npm run dev:front      # http://localhost:3000
npm run build:front
npm run start:front
npm run test:front
npm run lint:front
```

Dentro de `blog-educacional/frontend/` os scripts equivalentes são `npm run dev`,
`npm run build`, `npm start`, `npm test`, `npm run lint` e `npm run type-check`.

## Testes do frontend

```bash
npm run test:front   # da raiz
```

O Jest é configurado por `next/jest`, que aplica as mesmas transformações SWC do
build — inclusive a do styled-components declarada em `next.config.ts`. Um
transformer genérico geraria nomes de classe diferentes dos de produção, e os
testes deixariam de refletir o que o usuário vê.

## Acessibilidade

O que está implementado, para servir de checklist em mudanças futuras:

- Todo campo passa pelo primitivo `form-field`, que amarra `<label htmlFor>`,
  `aria-describedby` (condicional — apontar para id inexistente é descartado
  por parte das tecnologias assistivas) e `aria-invalid` só quando há erro.
- Erro nunca é comunicado só por cor: há marcador de texto junto.
- Formulário com erro mostra um resumo em `role="alert"` que recebe foco e
  linka para os campos inválidos.
- Resultado de busca, carregamento e confirmações vão para regiões `aria-live`.
- Exclusão usa `<dialog>` nativo com `showModal()`: prisão de foco, `Esc` e
  fundo inerte vêm da plataforma. O foco inicial é o **Cancelar**.
- Ações de linha têm nome acessível único (`Editar post: <título>`), não uma
  fileira de botões "Editar" indistinguíveis.
- Tabelas viram cartões abaixo de 768px com os `role` redeclarados — trocar o
  `display` de `<table>` destrói a semântica implícita em todos os navegadores.
- Alvos de toque com no mínimo 44px; campos com fonte ≥1rem para o iOS não dar
  zoom no foco.
- `prefers-reduced-motion` respeitado globalmente; foco visível preservado.
- Um `<h1>` por página, `lang="pt-BR"` e skip link para o conteúdo.

Verificação manual sugerida: navegar a aplicação inteira só pelo teclado
(Tab / Enter / Esc), emular 375px de largura e conferir as tabelas
administrativas como cartões, e rodar o Lighthouse (aba Acessibilidade) na home
e na página de post.

## Frontend em produção

A imagem é publicada como `<usuário>/blog-educacional-frontend` pelo mesmo
workflow do backend, já apontando para a URL do Render. Dá para sobrescrever
pela variável de repositório `NEXT_PUBLIC_API_URL` no GitHub (em **vars**, não
em secrets: é URL pública, e um secret mascarado em log tornaria uma
configuração errada indepurável).

Depois de publicar, ajuste `CORS_ORIGIN` no serviço do backend no Render para a
origem do frontend — sem isso o navegador barra todas as chamadas.
