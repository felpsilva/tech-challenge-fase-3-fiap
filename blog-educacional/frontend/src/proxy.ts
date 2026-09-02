import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth/auth-cookie'
import { decodeJwtPayload, isExpired } from '@/lib/auth/decode-jwt'
import { canAccessPanel, canManageUsers } from '@/types/permissions'

/**
 * No Next 16 o `middleware.ts` foi renomeado para `proxy.ts`, com a funcao
 * exportada como `proxy`. Runtime e sempre nodejs, nao configuravel.
 *
 * Isto e navegacao, nao autorizacao: as claims sao lidas sem verificar
 * assinatura (ver `decode-jwt.ts`). Quem decide de verdade e o backend, que
 * confere o token em toda rota protegida. A propria documentacao do Next 16
 * avisa para nao depender so do proxy.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const claims = token ? decodeJwtPayload(token) : null
    const session = claims && !isExpired(claims) ? claims : null

    if (pathname === '/login') {
        // Ja logado nao precisa ver tela de login.
        return session
            ? NextResponse.redirect(new URL('/admin/posts', request.url))
            : NextResponse.next()
    }

    if (!session) {
        const url = new URL('/login', request.url)
        url.searchParams.set('next', pathname)

        // Havia cookie mas a sessao morreu: vale avisar em vez de so redirecionar.
        if (token) {
            url.searchParams.set('reason', 'expired')
        }

        const response = NextResponse.redirect(url)
        response.cookies.delete(AUTH_COOKIE_NAME)

        return response
    }

    if (!canAccessPanel(session.permission)) {
        return NextResponse.redirect(new URL('/sem-permissao', request.url))
    }

    if (pathname.startsWith('/admin/users') && !canManageUsers(session.permission)) {
        return NextResponse.redirect(new URL('/sem-permissao', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
}
