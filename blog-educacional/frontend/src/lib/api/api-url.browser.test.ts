/**
 * @jest-environment jsdom
 */
export {}

const PRODUCTION_URL = 'https://blog-educacional-backend-1.onrender.com'

describe('resolveApiBaseUrl (navegador)', () => {
    beforeEach(() => {
        jest.resetModules()
        delete process.env.API_URL
        delete process.env.NEXT_PUBLIC_API_URL
    })

    it('usa NEXT_PUBLIC_API_URL mesmo com API_URL definida', async () => {
        process.env.API_URL = 'http://backend:3001'
        process.env.NEXT_PUBLIC_API_URL = PRODUCTION_URL

        const { resolveApiBaseUrl } = await import('./api-url')

        expect(resolveApiBaseUrl()).toBe(PRODUCTION_URL)
    })

    it('usa localhost quando nada esta configurado', async () => {
        const { resolveApiBaseUrl } = await import('./api-url')

        expect(resolveApiBaseUrl()).toBe('http://localhost:3001')
    })
})
