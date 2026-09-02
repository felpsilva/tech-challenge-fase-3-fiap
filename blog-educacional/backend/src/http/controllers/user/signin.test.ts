import { createAuthenticatedTestApp, testUserCredentials } from '@/test/helpers/authenticated-test-app'
import { globalErrorHandler } from '@/utils/global-error-handler'

/**
 * Trava o `id` nas claims. Sem ele, um professor nao tem como descobrir o
 * proprio `user_id` — o `POST /post` exige esse campo no corpo e as rotas de
 * `/user` sao restritas a admin. Ou seja: professor nenhum criaria post.
 */
describe('POST /user/signin token claims', () => {
    let app: Awaited<ReturnType<typeof createAuthenticatedTestApp>>['app']
    let token: string

    beforeAll(async () => {
        const testApp = await createAuthenticatedTestApp(async (appInstance) => {
            // O helper nao instala o error handler que o `app.ts` registra, e
            // sem ele o InvalidCredentialsError sai como 500.
            appInstance.setErrorHandler(globalErrorHandler)
        })

        app = testApp.app
        token = testApp.token
    })

    afterAll(async () => {
        await app.close()
    })

    it('signs a token that carries the user id, username and permission', () => {
        const claims = app.jwt.decode(token) as Record<string, unknown> | null

        expect(claims).toMatchObject({
            id: 1,
            username: testUserCredentials.username,
            permission: 'admin',
        })
        expect(typeof claims?.id).toBe('number')
    })

    it('returns 401 when the password does not match', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/user/signin',
            payload: {
                username: testUserCredentials.username,
                password: 'senha-errada',
            },
        })

        expect(response.statusCode).toBe(401)
    })
})
