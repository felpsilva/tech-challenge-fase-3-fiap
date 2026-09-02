# Blog Educacional — Tech Challenge FIAP

Aplicação de blog educacional composta por **API (Fastify + TypeORM)** e
**interface web (Next.js 16 + React 19)**, com **PostgreSQL no Neon (remoto)**,
orquestrada com Docker Compose.

## Arquitetura — separação de containers

O projeto usa **3 containers**, cada um com uma responsabilidade única:

| Container   | Imagem              | Papel                                                         | Porta (host) |
| ----------- | ------------------- | ------------------------------------------------------------- | ------------ |
| `neon-init` | `postgres:16-alpine`| Bootstrap idempotente do schema/seed no Neon via `db/init.sql`| -            |
| `backend`   | build `./backend`   | API REST — regras de negócio e acesso ao Neon                 | 3001         |
| `frontend`  | build `./frontend`  | Interface web (Next.js App Router)                            | 3000         |

### Por que essa separação faz sentido neste contexto?

- **Banco gerenciado no Neon.** Não há container local de banco para manter.
- **Bootstrap automático.** O container `neon-init` aplica `db/init.sql` antes
  do backend subir, evitando erro de tabela inexistente em ambiente novo.
- **Front e API separados.** O navegador fala direto com a API, sem camada de
  proxy no meio. O preço dessa escolha é explícito: o CORS passa a ser
  configuração obrigatória do backend (`CORS_ORIGIN`) e o frontend precisa de
  duas URLs da API — uma para o navegador, outra para o próprio servidor do
  Next dentro da rede do compose. Veja [Frontend](#frontend).
```
┌────────────┐       ┌────────────┐       ┌────────────┐
│ neon-init  │─────> │  backend   │ <──── │  frontend  │
│ aplica SQL │       │  Fastify   │       │  Next.js   │
└────────────┘       │  :3001     │       │  :3000     │
         ^           └────────────┘       └────────────┘
         └──────> Neon PostgreSQL remoto
```

## Configuração (`.env` na raiz)

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

Duas ressalvas:

- **A imagem Docker não enxerga o `.env` da raiz.** O contexto de build é
  `./backend` ou `./frontend`, um nível abaixo dele. Em container a
  configuração chega pelo `env_file`/`environment` do compose (que aponta para
  `../.env`) e pelo `ARG NEXT_PUBLIC_API_URL`.
- **A saída `standalone` do Next não carrega o `next.config.ts` em runtime.**
  Em produção containerizada o `API_URL` vem do ambiente, não do arquivo.

O `.env` é versionado por decisão do projeto (trabalho acadêmico, avaliador
precisa subir sem configurar nada). Em um projeto real as credenciais do banco
e o `JWT_SECRET` não deveriam estar aqui.

## Como subir a aplicação

Pré-requisito: Docker + Docker Compose.

```bash
docker compose up --build
```

Acesse:

- **Interface:** http://localhost:3000
- **API:** http://localhost:3001

Para rodar em segundo plano: `docker compose up --build -d`
Para derrubar: `docker compose down`.

## Produção

A API também está publicada em produção no Render, consumindo a imagem do backend
publicada no Docker Hub.
- **URL da imagem do backend no Docker Hub:** https://hub.docker.com/repository/docker/fpsilva777/blog-educacional-backend/tags
- A imagem do frontend é publicada como `<usuário>/blog-educacional-frontend`
  pelo mesmo workflow, já apontando para a URL do Render. Dá para sobrescrever
  pela variável de repositório `NEXT_PUBLIC_API_URL` no GitHub (em **vars**,
  não em secrets: é URL pública, e um secret mascarado em log tornaria uma
  configuração errada indepurável).
- Depois de publicar o frontend, ajuste `CORS_ORIGIN` no serviço do backend no
  Render para a origem dele.

- **URL da API em produção:** https://blog-educacional-backend-1.onrender.com/

Sobre atualizações em produção: o deploy é feito no github, o workflow encaminha para a imagem do Docker Hub, e o Render puxa a imagem,
porém, o Render não atualiza automaticamente a imagem, então é necessário ir no painel do Render e clicar em "Manual Deploy" para atualizar a imagem.

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

### Perfis de acesso

- **visitante anônimo** (sem token): lê os posts **publicados** e as imagens deles.
- `aluno`: o mesmo do visitante, com conta.
- `professor`: pode criar, listar, atualizar e remover categorias e posts.
- `admin`: acesso administrativo completo, incluindo a gestão de usuários.

### Rotas principais

- `POST /user/signin`: autentica e retorna o token JWT.
- `POST /user`: cria usuário novo, restrito a `admin`.
- `POST /category`: cria categoria, restrito a `admin` e `professor`.
- `POST /post`: cria publicação, restrito a `admin` e `professor`.
- `GET /post`, `GET /post/search?q=` e `GET /post/:id`: consulta posts, **público**.
- `PUT /post/:id`: atualiza a publicação, restrito a `admin` e `professor`. Aceita
  `categories`, o que permite trocar a categoria de um post já criado.
- `GET /category`, `GET /category/:id`, `PUT` e `DELETE` das categorias: restrito a `admin` e `professor`.
- `POST /post/:id/thumbnail`: envia o arquivo de imagem da thumbnail (`multipart/form-data`), restrito a `admin` e `professor`.
- `GET /post/:id/thumbnail`: devolve o arquivo da thumbnail, **público** — uma tag
  `<img>` do navegador não envia header `Authorization`.
- `DELETE /post/:id/thumbnail`: remove a thumbnail do post, restrito a `admin` e `professor`.

#### O que "público" significa aqui

As rotas de leitura de post respondem sem token, mas **rascunho não é conteúdo
publicado**: sem um token válido, `GET /post` e `GET /post/search` devolvem só
os itens com `status: 'published'`, e `GET /post/:id` de um rascunho responde
`404` (e não `403`, que já confirmaria a existência do post). Com token, o
autor continua vendo os próprios rascunhos.

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

## Frontend

Interface em **Next.js 16 (App Router)** com **React 19**, **styled-components**,
**Formik + Yup** nos formulários e **axios** nas chamadas à API.

### Páginas

| Rota | O que faz | Acesso |
| --- | --- | --- |
| `/` | Lista os posts publicados (título, autor, resumo de 2 linhas) com busca | público |
| `/posts/[id]` | Conteúdo completo do post | público |
| `/login` | Autenticação | público |
| `/admin/posts` | Listagem administrativa com editar/excluir | professor, admin |
| `/admin/posts/new` · `/admin/posts/[id]/edit` | Criação e edição de post | professor, admin |
| `/admin/categories` | Listagem administrativa de categorias | professor, admin |
| `/admin/categories/new` · `/admin/categories/[id]/edit` | Criação e edição de categoria | professor, admin |
| `/admin/users` | Gestão de permissões e exclusão de usuários | **admin** |

### As duas URLs da API

Esta é a configuração que mais dá problema, então vale a explicação:

| Variável | Quem usa | Valor no compose | Valor em produção |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | o **navegador** (axios e o `<img>` da thumbnail) | `http://localhost:3001` | `https://blog-educacional-backend-1.onrender.com` |
| `API_URL` | o **servidor** do Next (Server Components) | `http://backend:3001` | `https://blog-educacional-backend-1.onrender.com` |

Os valores de produção vêm do `.env.production` da raiz. No build da imagem
Docker eles não chegam (o contexto é `./frontend`), então o workflow passa a
URL como `build-args` — com a mesma URL como padrão, caso a variável de
repositório `NEXT_PUBLIC_API_URL` não esteja definida.

Uma variável só não atende os dois: dentro do compose o servidor do Next
alcança a API pelo DNS interno, mas o navegador do usuário só alcança a porta
publicada no host. Apontar `NEXT_PUBLIC_API_URL` para `http://backend:3001`
produz um site em que o SSR funciona e **toda** interação do cliente falha com
erro de DNS.

Detalhe importante do `NEXT_PUBLIC_*`: ele é embutido no bundle em tempo de
**build**, não lido em runtime. Por isso ele é `ARG` no Dockerfile e
`build-args` no workflow — trocar o host da API em produção exige rebuild da
imagem, não só mudar variável de ambiente.

### Decisões que valem registro

- **Sessão em cookie legível por JavaScript, não `httpOnly`.** Sem uma camada
  de proxy no servidor, o axios precisa ler o token para montar o header
  `Authorization`. Um cookie `httpOnly` exigiria um endpoint que devolvesse o
  token — e aí qualquer script injetado chamaria esse endpoint, deixando a
  mesma superfície de ataque com mais peça móvel. O cookie ganha do
  `localStorage` porque a guarda de rota consegue lê-lo no servidor e porque o
  `Max-Age`, derivado do `exp`, faz o próprio navegador ser o cronômetro da
  sessão (a API não tem refresh). Não há risco de CSRF: o token vai num header
  montado à mão, e o backend nem lê cookie.
- **A guarda de rota é navegação, não autorização.** O `proxy.ts` lê as claims
  sem verificar assinatura, porque o `JWT_SECRET` não pode ir para o bundle.
  Alguém pode forjar um cookie e ver a *casca* do painel — e nenhum dado, já
  que toda requisição leva esse token ao Fastify, que confere a assinatura.
- **A busca filtra no cliente em vez de chamar `GET /post/search`.** O `ILIKE`
  do backend é insensível a caixa mas **não a acento**: procurar "matematica"
  não acharia "Matemática", o que num blog em português é defeito. Como a API
  não pagina, a lista já está em memória — filtrar é instantâneo, casa termo a
  termo e dobra os acentos dos dois lados.
- **Paginação no cliente**, pelo mesmo motivo: nenhuma listagem da API aceita
  `page`/`limit`.
- **`<img>` simples nas imagens, não `next/image`.** O `image_url` é texto
  livre, então o conjunto de hosts para `images.remotePatterns` é desconhecido
  por definição; e o Next 16 passou a bloquear otimização de IP local, o que
  quebraria a thumbnail vinda de `localhost:3001` em desenvolvimento.
- **Resumo de duas linhas por CSS (`line-clamp`), não por corte de string.**
  "Duas linhas" depende da largura renderizada e da fonte carregada: cortar por
  contagem de caracteres daria duas linhas no desktop e quatro no celular.

### Comandos

```bash
npm run dev:front      # desenvolvimento em http://localhost:3000
npm run build:front
npm run test:front
npm run lint:front
```

## Testes

```bash
npm test          # roda as duas suítes
npm run test:back # jest --runInBand no backend
npm run test:front
```

Backend e frontend usam **Jest**. No frontend ele vem via `next/jest`, que
aplica as mesmas transformações SWC do build — inclusive a do
styled-components configurada no `next.config.ts`. Um transformer genérico
geraria nomes de classe diferentes dos de produção.

## Dados de demonstração (seed)

Na subida, o `db/init.sql` cria o schema e popula dados de exemplo no Neon.
Como o script é idempotente (`IF NOT EXISTS` e `ON CONFLICT`), ele pode rodar
em toda inicialização sem duplicar estrutura/dados sensíveis:

- Usuário: **admin** · senha: **admin123** (permissão `admin`)

Para reaplicar o bootstrap: `docker compose up --build`.

## Estrutura

```
.
├── docker-compose.yml      # orquestra neon-init + backend + frontend
├── db/
│   └── init.sql            # schema + seed (TypeORM)
├── backend/                # API Fastify + TypeORM (Dockerfile próprio)
└── frontend/               # Next.js 16 App Router (Dockerfile multi-stage)
```

## Observações técnicas

- O backend roda o TypeScript diretamente via `tsx` (sem etapa de build), e por
  isso seu Dockerfile é single-stage. O frontend **tem** etapa de compilação, e
  por isso o dele é multi-stage com a saída `standalone` do Next. A assimetria
  entre os dois Dockerfiles é intencional.
- A home é pré-renderizada com revalidação de 60s. A busca no servidor tolera a
  API fora do ar em vez de lançar: sem isso, o `docker build` do frontend
  quebraria, já que o `next build` pré-renderiza a home e a API não está de pé
  durante o build. Nesse caso a página mostra um aviso e se recupera sozinha na
  primeira revalidação.
- Não há migrations: todo o schema vive em `db/init.sql`, aplicado de forma
  idempotente pelo container `neon-init` a cada subida. Coluna ou tabela nova
  precisa entrar lá com `IF NOT EXISTS`, senão o `ON_ERROR_STOP=1` derruba o
  bootstrap na segunda execução.
- Variáveis de ambiente: backend e frontend compartilham o `.env` da raiz — o
  backend precisa de `CORS_ORIGIN` além das credenciais do banco e do
  `JWT_SECRET`; o frontend precisa de `NEXT_PUBLIC_API_URL` e `API_URL`. O
  modelo completo está em `.env.example`, e a mecânica em
  [Configuração](#configuração-env-na-raiz).
- Uploads vão para o banco, não para o disco: o container do backend não tem
  volume e a imagem é recriada a cada deploy, então qualquer arquivo salvo no
  filesystem se perderia.
- O hash de senha nunca sai do banco: a coluna `password` da entidade `User`
  tem `select: false`, então nenhuma consulta o traz por engano — nem quando o
  usuário é carregado como relação (o autor em `GET /post`). O único ponto que
  pede a coluna explicitamente é o `findByUsername`, usado pelo `signin` para
  comparar o hash com o bcrypt.
