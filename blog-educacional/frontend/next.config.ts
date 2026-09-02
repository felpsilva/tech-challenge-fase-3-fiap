import type { NextConfig } from 'next'

import { loadRootEnv } from './src/lib/env/load-root-env'

// Antes de qualquer coisa: o `.env` do projeto fica na raiz do repositorio,
// fora do alcance do carregador do Next. Precisa acontecer aqui porque
// `NEXT_PUBLIC_*` e inlinado no bundle durante o build.
loadRootEnv()

const nextConfig: NextConfig = {
    // `standalone` deixa a imagem Docker com so o que e importado de verdade,
    // em vez de carregar o node_modules inteiro.
    output: 'standalone',
    reactStrictMode: true,
    compiler: {
        // Sem isto o styled-components gera nomes de classe diferentes no
        // servidor e no cliente, e cada componente estilizado da erro de
        // hidratacao.
        styledComponents: {
            displayName: process.env.NODE_ENV !== 'production',
            ssr: true,
        },
    },
}

export default nextConfig
