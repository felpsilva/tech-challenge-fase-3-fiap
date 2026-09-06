import { decodeJwtPayload } from './decode-jwt'

export const AUTH_COOKIE_NAME = 'blog_token'

// Legivel por JavaScript de proposito: sem um BFF, o axios precisa ler o token.
// Nao ha risco de CSRF — o token vai num header montado a mao, o backend nao le cookie.
export function readAuthToken(): string | null {
    if (typeof document === 'undefined') {
        return null
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`))

    return match?.[1] ? decodeURIComponent(match[1]) : null
}

export function writeAuthToken(token: string) {
    if (typeof document === 'undefined') {
        return
    }

    const claims = decodeJwtPayload(token)
    const secondsLeft = claims ? Math.floor(claims.exp - Date.now() / 1000) : 0
    const maxAge = Math.max(0, Math.min(secondsLeft, 3600))
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''

    document.cookie =
        `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

export function clearAuthToken() {
    if (typeof document === 'undefined') {
        return
    }

    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}
