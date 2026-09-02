/**
 * @jest-environment jsdom
 */
// Sem `import` no topo, o TS trataria o arquivo como script global e
// `PRODUCTION_URL` colidiria entre os dois testes.
export {}

const PRODUCTION_URL = 'https://blog-educacional-backend-1.onrender.com'

describe('resolveApiBaseUrl (navegador)', () => {
    beforeEach(() => {
        jest.resetModules()
        delete process.env.API_URL
        delete process.env.NEXT_PUBLIC_API_URL
    })

    it('usa NEXT_PUBLIC_API_URL mesmo com API_URL definida', async () => {
        // `API_URL` e o hostname interno do compose: resolver isso no
        // navegador daria erro de DNS em toda interacao do cliente.
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
