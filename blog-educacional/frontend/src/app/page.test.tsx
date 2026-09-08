import { screen } from '@testing-library/react'
import { connection } from 'next/server'
import { renderWithTheme } from '@/test/render-with-theme'
import { serverGet } from '@/lib/api/server-fetch'
import HomePage from './page'
import type { Post } from '@/types/api'

jest.mock('next/server', () => ({ connection: jest.fn().mockResolvedValue(undefined) }))
jest.mock('@/lib/api/server-fetch', () => ({ serverGet: jest.fn() }))

const connectionMock = connection as jest.MockedFunction<typeof connection>
const serverGetMock = serverGet as jest.MockedFunction<typeof serverGet>

function makePost(id: number, title: string): Post {
    return {
        id,
        user_id: 1,
        title,
        slug: `post-${id}`,
        content: 'Conteudo do post.',
        image_url: null,
        status: 'published',
        created_at: '2026-08-01T12:00:00.000Z',
        updated_at: '2026-08-01T12:00:00.000Z',
        user: { id: 1, username: 'ana', permission: 'professor', created_at: '' },
        categories: [],
    }
}

async function renderHome() {
    renderWithTheme(await HomePage())
}

describe('HomePage', () => {
    beforeEach(() => {
        connectionMock.mockResolvedValue(undefined)
    })

    /**
     * Este e o teste que importa para o deploy, nao um detalhe de implementacao.
     *
     * Sem o `connection()`, o Next marca `/` como estatica e a renderiza durante
     * o `next build` — dentro do `docker build`, onde a API nao existe. O
     * resultado com o aviso de erro virava HTML congelado na imagem, e o
     * primeiro visitante depois de cada deploy recebia esse HTML velho enquanto
     * a revalidacao rodava em background. Chamar `connection()` tira a rota do
     * prerender: nada e congelado e a primeira requisicao ja busca dados reais.
     */
    it('sai do prerender de build antes de tocar na API', async () => {
        serverGetMock.mockResolvedValue({ ok: true, data: [] })

        await renderHome()

        // `?? Infinity` / `?? -Infinity` mantem a assercao falhando quando a
        // chamada nao aconteceu, em vez de estourar em undefined.
        const ordemConnection = connectionMock.mock.invocationCallOrder.at(0) ?? Infinity
        const ordemFetch = serverGetMock.mock.invocationCallOrder.at(0) ?? -Infinity

        expect(connectionMock).toHaveBeenCalledTimes(1)
        expect(ordemConnection).toBeLessThan(ordemFetch)
    })

    it('busca os posts sem cache', async () => {
        serverGetMock.mockResolvedValue({ ok: true, data: [] })

        await renderHome()

        expect(serverGetMock).toHaveBeenCalledWith('/post')
    })

    it('lista apenas os posts publicados', async () => {
        serverGetMock.mockResolvedValue({
            ok: true,
            data: [makePost(1, 'Fracoes'), { ...makePost(2, 'Rascunho'), status: 'draft' }],
        })

        await renderHome()

        expect(screen.getByText('Fracoes')).toBeInTheDocument()
        expect(screen.queryByText('Rascunho')).not.toBeInTheDocument()
    })

    it('mostra aviso quando a API nao responde', async () => {
        serverGetMock.mockResolvedValue({
            ok: false,
            status: 0,
            message: 'Não foi possível contatar a API.',
        })

        await renderHome()

        expect(screen.getByText(/Não foi possível contatar a API/)).toBeInTheDocument()
    })
})
