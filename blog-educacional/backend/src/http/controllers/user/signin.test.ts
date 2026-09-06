import { createAuthenticatedTestApp, testUserCredentials } from '@/test/helpers/authenticated-test-app'
import { globalErrorHandler } from '@/utils/global-error-handler'

describe('POST /user/signin token claims', () => {
    let app: Awaited<ReturnType<typeof createAuthenticatedTestApp>>['app']
    let token: string

    beforeAll(async () => {
        const testApp = await createAuthenticatedTestApp(async (appInstance) => {
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
