export interface JwtClaims {
    id: number
    username: string
    permission: string
    iat: number
    exp: number
}

function decodeBase64Url(segment: string) {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const raw = atob(padded)

    // O TextDecoder e necessario para username com acento sobreviver: `atob`
    // devolve bytes latin1, nao UTF-8.
    return new TextDecoder().decode(Uint8Array.from(raw, (char) => char.charCodeAt(0)))
}

/**
 * Le as claims SEM verificar a assinatura, e isso e proposital.
 *
 * O `JWT_SECRET` nao pode chegar ao frontend (ficaria numa camada da imagem
 * Docker e no bundle). Consequencia honesta: alguem pode forjar um cookie com
 * `permission: 'admin'` e ver a casca do painel — e nao vera dado nenhum,
 * porque toda requisicao leva esse token forjado ao Fastify, que confere a
 * assinatura e responde 401. O `proxy.ts` faz navegacao, nao autorizacao. A
 * autorizacao real e a do backend.
 */
export function decodeJwtPayload(token: string): JwtClaims | null {
    try {
        const segment = token.split('.')[1]

        if (!segment) {
            return null
        }

        const claims = JSON.parse(decodeBase64Url(segment)) as Partial<JwtClaims>

        if (
            typeof claims.id !== 'number' ||
            typeof claims.username !== 'string' ||
            typeof claims.permission !== 'string' ||
            typeof claims.exp !== 'number'
        ) {
            return null
        }

        return claims as JwtClaims
    } catch {
        return null
    }
}

export function isExpired(claims: JwtClaims) {
    return claims.exp * 1000 <= Date.now()
}
