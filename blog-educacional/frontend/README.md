# Frontend — Blog Educacional

Interface em Next.js 16 (App Router) que consome a API em `../backend`.

## Rodar em desenvolvimento

```bash
cp .env.example .env.local   # ajuste as URLs se a API não estiver em :3001
npm ci
npm run dev                  # http://localhost:3000
```

A API precisa estar no ar. Suba o backend com `npm --prefix ../backend start`
ou `docker compose up` na raiz de `blog-educacional/`.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack, padrão no Next 16) |
| `npm run build` | Build de produção com saída `standalone` |
| `npm start` | Serve o build |
| `npm run lint` | ESLint (o `next lint` foi removido no Next 16) |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Jest + Testing Library |

## Variáveis de ambiente

| Variável | Quem lê | Observação |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | navegador | **embutida no bundle em tempo de build** |
| `API_URL` | servidor do Next | lida em runtime; no compose aponta para `http://backend:3001` |

## Mapa do código

```
src/
├── proxy.ts                  guarda de /admin/* (no Next 16 era middleware.ts)
├── app/                      rotas do App Router
├── components/
│   ├── layout/               cabeçalho, rodapé, navegação, skip link
│   └── ui/                   primitivos (form-field, button, data-table, dialog…)
├── features/
│   ├── auth/                 formulário de login e guarda de sessão
│   ├── posts/                cartão, lista, artigo, formulário, tabela admin
│   ├── categories/           formulário e tabela
│   └── users/                tabela com gestão de permissão
├── lib/
│   ├── api/                  cliente axios, normalização de erro, serviços
│   ├── auth/                 cookie de sessão, decode do JWT, contexto
│   ├── hooks/                debounce, paginação, recurso assíncrono, slug
│   └── utils/                slugify, excerpt, formatação
├── styles/                   tema, tokens, registry de SSR, estilo global
└── types/                    tipos da API e vocabulários (status, permissões)
```

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

## Verificação manual sugerida

- Navegar a aplicação inteira só pelo teclado (Tab / Enter / Esc).
- Emular 375px de largura e conferir as tabelas administrativas como cartões.
- Rodar o Lighthouse (aba Acessibilidade) na home e na página de post.
