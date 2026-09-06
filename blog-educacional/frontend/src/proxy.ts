import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth/auth-cookie'
import { decodeJwtPayload, isExpired } from '@/lib/auth/decode-jwt'
import { canAccessPanel, canManageUsers } from '@/types/permissions'

// Navegacao, nao autorizacao: as claims sao lidas sem verificar assinatura.
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const claims = token ? decodeJwtPayload(token) : null
    const session = claims && !isExpired(claims) ? claims : null

    if (pathname === '/login') {
        return session
            ? NextResponse.redirect(new URL('/admin/posts', request.url))
            : NextResponse.next()
    }

    if (!session) {
        const url = new URL('/login', request.url)
        url.searchParams.set('next', pathname)

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
