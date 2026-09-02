/**
 * Ambiente `node` de proposito: sem `window`, `resolveApiBaseUrl` cai no ramo
 * de servidor (Server Components). O ramo de navegador esta em
 * `api-url.browser.test.ts`, que roda em jsdom.
 *
 * @jest-environment node
 */
// Sem `import` no topo, o TS trataria o arquivo como script global e
// `PRODUCTION_URL` colidiria entre os dois testes.
export {}

const PRODUCTION_URL = 'https://blog-educacional-backend-1.onrender.com'

/**
 * `api-url` le `process.env` na chamada, mas o modulo e reimportado a cada
 * caso para nao depender de ordem entre os testes.
 */
async function importApiUrl() {
    return import('./api-url')
}

describe('resolveApiBaseUrl (servidor)', () => {
    const originalEnv = { ...process.env }

    beforeEach(() => {
        jest.resetModules()
        delete process.env.API_URL
        delete process.env.NEXT_PUBLIC_API_URL
    })

    afterAll(() => {
        process.env = originalEnv
    })

    it('prefere API_URL — no compose ela aponta para o nome do servico', async () => {
        process.env.API_URL = 'http://backend:3001'
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'

        const { resolveApiBaseUrl } = await importApiUrl()

        expect(resolveApiBaseUrl()).toBe('http://backend:3001')
    })

    it('cai para NEXT_PUBLIC_API_URL quando API_URL nao existe', async () => {
        process.env.NEXT_PUBLIC_API_URL = PRODUCTION_URL

        const { resolveApiBaseUrl } = await importApiUrl()

        expect(resolveApiBaseUrl()).toBe(PRODUCTION_URL)
    })

    it('usa localhost quando nada esta configurado', async () => {
        const { resolveApiBaseUrl } = await importApiUrl()

        expect(resolveApiBaseUrl()).toBe('http://localhost:3001')
    })

    it('remove a barra final da URL de producao', async () => {
        // A URL do Render e divulgada com barra no fim. Sem cortar, `/post`
        // viraria `//post` e o Fastify responderia 404.
        process.env.API_URL = `${PRODUCTION_URL}/`

        const { resolveApiBaseUrl } = await importApiUrl()

        expect(resolveApiBaseUrl()).toBe(PRODUCTION_URL)
    })
})

describe('resolvePublicApiBaseUrl', () => {
    beforeEach(() => {
        jest.resetModules()
        delete process.env.API_URL
        delete process.env.NEXT_PUBLIC_API_URL
    })

    it('ignora API_URL: a URL vai para <img src>, lido pelo navegador', async () => {
        process.env.API_URL = 'http://backend:3001'
        process.env.NEXT_PUBLIC_API_URL = PRODUCTION_URL

        const { resolvePublicApiBaseUrl } = await importApiUrl()

        expect(resolvePublicApiBaseUrl()).toBe(PRODUCTION_URL)
    })

    it('remove a barra final da URL de producao', async () => {
        process.env.NEXT_PUBLIC_API_URL = `${PRODUCTION_URL}/`

        const { resolvePublicApiBaseUrl } = await importApiUrl()

        expect(resolvePublicApiBaseUrl()).toBe(PRODUCTION_URL)
    })
})
