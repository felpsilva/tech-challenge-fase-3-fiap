/**
 * No servidor a chamada sai de dentro da rede do compose (`API_URL`, que
 * aponta para o hostname do servico). No navegador sai do host, e a URL
 * precisa ser a porta publicada (`NEXT_PUBLIC_API_URL`, embutida no bundle
 * durante o build). Uma variavel unica nao atende os dois — apontar
 * `NEXT_PUBLIC_API_URL` para `http://backend:3001` faz o SSR funcionar e
 * toda interacao do cliente falhar com erro de DNS.
 */
const FALLBACK_URL = 'http://localhost:3001'

/** Barra no fim + path com barra viraria `//post`, que o Fastify responde 404. */
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

/** URL publica, sempre — vai para `<img src>`, lido pelo navegador. */
export function resolvePublicApiBaseUrl() {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_URL)
}
