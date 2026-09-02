import { decodeJwtPayload } from './decode-jwt'

export const AUTH_COOKIE_NAME = 'blog_token'

/**
 * Cookie legivel por JavaScript, e nao `httpOnly` — decisao consciente.
 *
 * `httpOnly` so protege de verdade se o token nunca entrar no JS, o que
 * exigiria proxiar toda chamada autenticada pelo servidor do Next (o BFF que
 * foi descartado). Sem esse proxy, o axios precisa ler o valor, o que
 * demandaria um endpoint que devolve o token — e aí qualquer script injetado
 * simplesmente chama esse endpoint. Ficaria a mesma superficie de ataque com
 * mais peça móvel.
 *
 * Contra `localStorage`, o cookie ganha em tres pontos: o `proxy.ts` consegue
 * ler no servidor, o `Max-Age` derivado do `exp` faz o navegador ser o
 * cronometro da sessao (nao ha refresh na API), e nao ha risco de CSRF porque
 * o token vai num header montado a mao, nunca como credencial ambiente — o
 * backend nem le cookie.
 */
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
