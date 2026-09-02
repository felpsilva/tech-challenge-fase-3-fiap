import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Rotas que respondem sem token.
 *
 * O casamento usa o padrao da rota (`request.routeOptions.url`), nao a URL
 * crua: `/post/1` chega aqui como `/post/:id`, e a comparacao de string
 * simples que existia antes nunca acertaria uma rota parametrizada.
 */
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

    // O preflight do CORS nunca manda Authorization. O @fastify/cors ja
    // responde antes daqui (a ordem do codigo-fonte no app.ts vale), mas o
    // bypass fica explicito para o middleware ser correto sozinho: o helper
    // de teste registra este hook sem o plugin de CORS.
    if (method === 'OPTIONS') {
        return
    }

    if (isPublicRoute(request.routeOptions?.url, method)) {
        // Leitura publica, mas se vier um token valido ele e aproveitado: o
        // controller usa `request.user` para decidir se mostra rascunho.
        // Token ausente ou expirado nao bloqueia a rota.
        await request.jwtVerify().catch(() => undefined)
        return
    }

    try {
        await request.jwtVerify()
    } catch {
        return reply.status(401).send({ message: 'Unauthorized' })
    }
}
