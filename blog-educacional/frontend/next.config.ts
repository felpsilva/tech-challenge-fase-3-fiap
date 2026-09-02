import type { NextConfig } from 'next'

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
