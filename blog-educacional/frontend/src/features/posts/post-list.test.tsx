import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '@/test/render-with-theme'
import { PostList } from './post-list'
import { toPostCard } from './to-post-card'
import type { Post } from '@/types/api'

function makePost(id: number, title: string, content: string): Post {
    return {
        id,
        user_id: 1,
        title,
        slug: `post-${id}`,
        content,
        image_url: null,
        status: 'published',
        created_at: '2026-08-01T12:00:00.000Z',
        updated_at: '2026-08-01T12:00:00.000Z',
        user: { id: 1, username: 'ana', permission: 'professor', created_at: '' },
        categories: [],
    }
}

const posts = [
    makePost(1, 'Matemática Básica', 'Frações e porcentagem.'),
    makePost(2, 'História do Brasil', 'Período colonial.'),
].map(toPostCard)

describe('PostList', () => {
    it('renders every post it receives', () => {
        renderWithTheme(<PostList posts={posts} />)

        expect(screen.getByText('Matemática Básica')).toBeInTheDocument()
        expect(screen.getByText('História do Brasil')).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent('2 posts encontrados')
    })

    it('filters ignoring accents, which the backend ILIKE would not do', async () => {
        const user = userEvent.setup()
        renderWithTheme(<PostList posts={posts} />)

        await user.type(screen.getByLabelText(/Buscar posts/), 'matematica')

        await waitFor(() => {
            expect(screen.queryByText('História do Brasil')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Matemática Básica')).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent('1 post encontrado')
    })

    it('matches every term, not just the whole string', async () => {
        const user = userEvent.setup()
        renderWithTheme(<PostList posts={posts} />)

        await user.type(screen.getByLabelText(/Buscar posts/), 'basica matematica')

        await waitFor(() => {
            expect(screen.queryByText('História do Brasil')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Matemática Básica')).toBeInTheDocument()
    })

    it('shows an empty state when nothing matches', async () => {
        const user = userEvent.setup()
        renderWithTheme(<PostList posts={posts} />)

        await user.type(screen.getByLabelText(/Buscar posts/), 'geografia')

        expect(await screen.findByText('Nenhum post corresponde à busca.')).toBeInTheDocument()
    })
})
