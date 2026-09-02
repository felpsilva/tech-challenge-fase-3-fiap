import fastify, { FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { validateJwt } from './jwt-validate'

const ALLOWED_ORIGIN = 'http://localhost:3000'

/**
 * Monta uma instancia minima com a mesma ordem de registro do `app.ts`.
 * Importar `@/app` aqui nao serve: ele inicializa o TypeORM e valida o env
 * de verdade no import.
 */
async function createTestApp() {
    const app = fastify()

    await app.register(fastifyCors, {
        origin: [ALLOWED_ORIGIN],
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })

    await app.register(fastifyJwt, { secret: 'test-jwt-secret' })

    app.addHook('onRequest', validateJwt)

    // Rota parametrizada publica: e o caso que a allowlist antiga, que
    // comparava a URL crua, nunca conseguia casar.
    app.get('/post/:id', async (request) => ({
        id: (request.params as { id: string }).id,
        // Devolve quem o middleware identificou, para provar o soft-verify.
        username: request.user?.username ?? null,
    }))

    app.put('/post/:id', async () => ({ updated: true }))

    await app.ready()

    return app
}

describe('validateJwt', () => {
    let app: FastifyInstance

    beforeAll(async () => {
        app = await createTestApp()
    })

    afterAll(async () => {
        await app.close()
    })

    it('answers a CORS preflight without requiring a token', async () => {
        const response = await app.inject({
            method: 'OPTIONS',
            url: '/post/1',
            headers: {
                origin: ALLOWED_ORIGIN,
                'access-control-request-method': 'GET',
            },
        })

        expect(response.statusCode).toBeLessThan(300)
        expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN)
    })

    it('allows PUT and DELETE in the preflight response', async () => {
        const response = await app.inject({
            method: 'OPTIONS',
            url: '/post/1',
            headers: {
                origin: ALLOWED_ORIGIN,
                'access-control-request-method': 'PUT',
            },
        })

        expect(response.headers['access-control-allow-methods']).toContain('PUT')
        expect(response.headers['access-control-allow-methods']).toContain('DELETE')
    })

    it('matches the route pattern instead of the concrete url', async () => {
        const response = await app.inject({ method: 'GET', url: '/post/42' })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ id: '42', username: null })
    })

    it('populates request.user on a public route when a valid token is sent', async () => {
        const token = app.jwt.sign({ id: 1, username: 'teste-user', permission: 'admin' })

        const response = await app.inject({
            method: 'GET',
            url: '/post/42',
            headers: { authorization: `Bearer ${token}` },
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ id: '42', username: 'teste-user' })
    })

    it('ignores an invalid token on a public route instead of failing', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/post/42',
            headers: { authorization: 'Bearer nao-e-um-token' },
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ id: '42', username: null })
    })

    it('returns 401 for a protected route without a token', async () => {
        const response = await app.inject({ method: 'PUT', url: '/post/1' })

        expect(response.statusCode).toBe(401)
        expect(response.json()).toEqual({ message: 'Unauthorized' })
    })

    it('returns 401 when a protected route receives an invalid token', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: '/post/1',
            headers: { authorization: 'Bearer nao-e-um-token' },
        })

        expect(response.statusCode).toBe(401)
    })
})
