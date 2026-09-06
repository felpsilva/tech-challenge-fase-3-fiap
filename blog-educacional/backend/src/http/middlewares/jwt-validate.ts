import { FastifyReply, FastifyRequest } from 'fastify'

// O casamento usa o padrao da rota (`request.routeOptions.url`), nao a URL crua:
// `/post/1` chega aqui como `/post/:id`.
const publicRoutes = [
    { route: '/user/signin', method: 'POST' },
    { route: '/post', method: 'GET' },
    { route: '/post/search', method: 'GET' },
    { route: '/post/:id', method: 'GET' },
    { route: '/post/:id/thumbnail', method: 'GET' },
]

function isPublicRoute(routePattern: string | undefined, method: string) {
    if (!routePattern) {
        return false
    }

    return publicRoutes.some((r) => r.route === routePattern && r.method === method)
}

export async function validateJwt(request: FastifyRequest, reply: FastifyReply) {
    const method = request.method.toUpperCase()

    if (method === 'OPTIONS') {
        return
    }

    if (isPublicRoute(request.routeOptions?.url, method)) {
        // Leitura publica com soft-verify: token valido e aproveitado (o controller usa
        // `request.user` para decidir se mostra rascunho), ausente ou expirado nao bloqueia.
        await request.jwtVerify().catch(() => undefined)
        return
    }

    try {
        await request.jwtVerify()
    } catch {
        return reply.status(401).send({ message: 'Unauthorized' })
    }
}
