# Blog Educacional — Tech Challenge FIAP (Fase 2)

Aplicação de blog educacional composta por **API (Fastify + TypeORM)** com
**PostgreSQL no Neon (remoto)**, orquestrada com Docker Compose.

## Arquitetura — separação de containers

O projeto usa **2 containers**, cada um com uma responsabilidade única:

| Container   | Imagem              | Papel                                                         | Porta (host) |
| ----------- | ------------------- | ------------------------------------------------------------- | ------------ |
| `neon-init` | `postgres:16-alpine`| Bootstrap idempotente do schema/seed no Neon via `db/init.sql`| -            |
| `backend`   | build `./backend`   | API REST — regras de negócio e acesso ao Neon                 | 3001         |

### Por que essa separação faz sentido neste contexto?

- **Banco gerenciado no Neon.** Não há container local de banco para manter.
- **Bootstrap automático.** O container `neon-init` aplica `db/init.sql` antes
  do backend subir, evitando erro de tabela inexistente em ambiente novo.
```
┌────────────┐       ┌────────────┐
│ neon-init  │─────> │  backend   │
│ aplica SQL │       │  Fastify   │
└────────────┘       │  :3001     │
         ^           └────────────┘
         └──────> Neon PostgreSQL remoto
```

## Como subir a aplicação

Pré-requisito: Docker + Docker Compose.

```bash
docker compose up --build
```

Acesse:

- **API:** http://localhost:3001

Para rodar em segundo plano: `docker compose up --build -d`
Para derrubar: `docker compose down`.

## Produção

A API também está publicada em produção no Render, consumindo a imagem do backend
publicada no Docker Hub.
- **URL do imagem no Docker Hub:** https://hub.docker.com/repository/docker/fpsilva777/blog-educacional-backend/tags

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

### Perfis de acesso

- `admin`: acesso administrativo completo.
- `professor`: pode criar, listar, atualizar e remover categorias e posts.
- `aluno`: pode consultar posts publicados.

### Rotas principais

- `POST /user/signin`: autentica e retorna o token JWT.
- `POST /user`: cria usuário novo, restrito a `admin`.
- `POST /category`: cria categoria, restrito a `admin` e `professor`.
- `POST /post`: cria publicação, restrito a `admin` e `professor`.
- `GET /post` e `GET /post/:id`: consulta posts, liberado para `admin`, `professor` e `aluno`.
- `GET /category`, `GET /category/:id`, `PUT` e `DELETE` das categorias: restrito a `admin` e `professor`.
- `POST /post/:id/thumbnail`: envia o arquivo de imagem da thumbnail (`multipart/form-data`), restrito a `admin` e `professor`.
- `GET /post/:id/thumbnail`: devolve o arquivo da thumbnail, liberado para `admin`, `professor` e `aluno`.
- `DELETE /post/:id/thumbnail`: remove a thumbnail do post, restrito a `admin` e `professor`.

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

## Dados de demonstração (seed)

Na subida, o `db/init.sql` cria o schema e popula dados de exemplo no Neon.
Como o script é idempotente (`IF NOT EXISTS` e `ON CONFLICT`), ele pode rodar
em toda inicialização sem duplicar estrutura/dados sensíveis:

- Usuário: **admin** · senha: **admin123** (permissão `admin`)

Para reaplicar o bootstrap: `docker compose up --build`.

## Estrutura

```
.
├── docker-compose.yml      # orquestra neon-init + backend
├── db/
│   └── init.sql            # schema + seed (TypeORM)
└── backend/                # API Fastify + TypeORM (Dockerfile próprio)
```

## Observações técnicas

- O backend roda o TypeScript diretamente via `tsx` (sem etapa de build).
- Não há migrations: todo o schema vive em `db/init.sql`, aplicado de forma
  idempotente pelo container `neon-init` a cada subida. Coluna ou tabela nova
  precisa entrar lá com `IF NOT EXISTS`, senão o `ON_ERROR_STOP=1` derruba o
  bootstrap na segunda execução.
- Uploads vão para o banco, não para o disco: o container do backend não tem
  volume e a imagem é recriada a cada deploy, então qualquer arquivo salvo no
  filesystem se perderia.
- O hash de senha nunca sai do banco: a coluna `password` da entidade `User`
  tem `select: false`, então nenhuma consulta o traz por engano — nem quando o
  usuário é carregado como relação (o autor em `GET /post`). O único ponto que
  pede a coluna explicitamente é o `findByUsername`, usado pelo `signin` para
  comparar o hash com o bcrypt.
