// No servidor a chamada sai de dentro da rede do compose (API_URL); no navegador,
// sai da porta publicada (NEXT_PUBLIC_API_URL, embutida no bundle durante o build).
const FALLBACK_URL = 'http://localhost:3001'

function stripTrailingSlash(url: string) {
    return url.replace(/\/+$/, '')
}

export function resolveApiBaseUrl() {
    if (typeof window === 'undefined') {
        return stripTrailingSlash(
            process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_URL,
        )
    }

    return stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_URL)
}

export function resolvePublicApiBaseUrl() {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_URL)
}
