# Frontend — Blog Educacional

Interface web do blog: um site público de leitura de posts e um painel
administrativo para quem publica. Consome a API Fastify em `../backend`.

- [Arquitetura](#arquitetura)
- [Tecnologias e como foram usadas](#tecnologias-e-como-foram-usadas)
- [Interfaces criadas](#interfaces-criadas)
- [Integração com o backend](#integração-com-o-backend)
- [Decisões de interface](#decisões-de-interface)
- [Como rodar](#como-rodar)
- [Testes](#testes)
- [Acessibilidade](#acessibilidade)

## Arquitetura

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
├── styles/       tema (claro/escuro), tokens, breakpoints, registry de SSR
├── types/        tipos da API e vocabulários (status, permissões)
└── proxy.ts      guarda de navegação de /admin/* e /login
```

A regra é sempre a mesma: **um arquivo em `app/` nunca chama a API direto**. Ele
monta o componente de `features/`, que usa um serviço de `lib/api/`. Isso deixa a
troca de cliente HTTP ou de rota da API restrita a uma camada.

## Tecnologias e como foram usadas

| Tecnologia | Onde e como é usada |
| --- | --- |
| **Next.js 16** (App Router) | Roteamento por arquivos, Server Components nas páginas públicas, `no-store` nas leituras públicas, `generateMetadata` no post, e `proxy.ts` como guarda de navegação (o antigo `middleware.ts`). |
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
`visually-hidden`, `theme-toggle`. São genéricos de propósito: nenhum conhece
post, categoria ou usuário. É o que permite que todos os formulários tenham o mesmo comportamento
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

`lib/api/server-fetch.ts` usa o `fetch` nativo com `cache: 'no-store'` e
**nunca lança**: devolve `{ ok: false, message }`. Assim, a home e os detalhes
buscam os dados atuais da API a cada carregamento.
Assim, uma API fora do ar rende um aviso na página em vez de uma tela de erro.

A home (`app/page.tsx`) chama `await connection()` antes desse fetch. Sem isso,
o Next classifica `/` como estática e a renderiza durante o `next build` — que
roda dentro do `docker build`, onde a API não existe. O resultado com o aviso
virava HTML congelado na imagem, e como o ISR serve a página vencida enquanto
revalida em background, **o primeiro visitante depois de cada deploy recebia o
aviso**; só o reload seguinte mostrava os posts.

Com `connection()` a rota sai do prerender (aparece como `ƒ` no build, não `○`)
e nada é congelado. `app/page.test.tsx` trava essa garantia.

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

Cinco escolhas que fogem do padrão e têm motivo:

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
- **Tema escuro por variáveis CSS, não por troca do objeto de tema.** O tema
  entregue ao styled-components aponta sempre para `var(--color-*)`; quem troca
  de paleta é o atributo `data-theme` no `<html>`. Trocar o objeto do
  `ThemeProvider` re-renderizaria a árvore inteira e, pior, o HTML do servidor
  sairia sempre claro — quem usa tema escuro veria um lampejo branco até a
  hidratação. Com variáveis, a troca é uma linha de CSS e nenhum componente
  precisou mudar.

## Como rodar

A API precisa estar no ar. Da raiz do repositório, `docker compose up --build`
sobe tudo; para rodar só o frontend:

```bash
npm ci
npm run dev          # http://localhost:3000
```

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack, padrão no Next 16) |
| `npm run build` | Build de produção com saída `standalone` |
| `npm start` | Serve o build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Jest + Testing Library |

A configuração vem do `.env` da raiz do repositório (`lib/env/load-root-env.ts`
sobe a árvore até achar o arquivo, parando no diretório que contém `.git`).

## Testes

```bash
npm test
```

O Jest é configurado por `next/jest`, que aplica as mesmas transformações SWC do
build — inclusive a do styled-components declarada em `next.config.ts`. Um
transformer genérico geraria nomes de classe diferentes dos de produção, e os
testes deixariam de refletir o que o usuário vê.

O tema tem testes próprios porque a lógica é fácil de quebrar em silêncio:
`styles/theme-mode.test.ts` cobre a resolução do modo, a persistência (inclusive
com armazenamento bloqueado) e o script anti-flash; `styles/theme.test.ts`
garante que as duas paletas têm os mesmos tokens e que nenhuma cor fixa vazou
para o objeto do tema; `components/ui/theme-toggle.test.tsx` cobre o botão,
a preferência do sistema e a escolha salva.

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
- O tema segue `prefers-color-scheme` por padrão e a escolha explícita no botão
  do cabeçalho tem precedência. O botão é um toggle com `aria-pressed`; o par
  sol/lua troca por CSS, então o ícone certo já aparece na primeira pintura.
  `color-scheme` é declarado nos dois modos, para que barras de rolagem e
  controles nativos do navegador acompanhem.
- Um `<h1>` por página, `lang="pt-BR"` e skip link para o conteúdo.

Verificação manual sugerida: navegar a aplicação inteira só pelo teclado
(Tab / Enter / Esc), emular 375px de largura e conferir as tabelas
administrativas como cartões, e rodar o Lighthouse (aba Acessibilidade) na home
e na página de post.
