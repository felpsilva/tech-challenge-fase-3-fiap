import type { NextConfig } from 'next'

import { loadRootEnv } from './src/lib/env/load-root-env'

loadRootEnv()

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    compiler: {
        styledComponents: {
            displayName: process.env.NODE_ENV !== 'production',
            ssr: true,
        },
    },
}

export default nextConfig
