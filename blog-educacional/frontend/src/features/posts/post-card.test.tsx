import { screen } from '@testing-library/react'
import { renderWithTheme } from '@/test/render-with-theme'
import { PostCard } from './post-card'
import { toPostCard } from './to-post-card'
import type { Post } from '@/types/api'

const post: Post = {
    id: 7,
    user_id: 1,
    title: 'Matemática Básica',
    slug: 'matematica-basica',
    content: 'Primeiro parágrafo do conteúdo.\n\nSegundo parágrafo que não deveria aparecer inteiro.',
    image_url: null,
    status: 'published',
    created_at: '2026-08-01T12:00:00.000Z',
    updated_at: '2026-08-01T12:00:00.000Z',
    user: { id: 1, username: 'professora-ana', permission: 'professor', created_at: '' },
    categories: [{ id: 2, name: 'Exatas', slug: 'exatas', created_at: '' }],
}

describe('PostCard', () => {
    it('shows the title, the author and the category', () => {
        renderWithTheme(<PostCard post={toPostCard(post)} />)

        expect(screen.getByText('Matemática Básica')).toBeInTheDocument()
        expect(screen.getByText('professora-ana')).toBeInTheDocument()
        expect(screen.getByText('Exatas')).toBeInTheDocument()
    })

    it('links to the post detail page with the title as accessible name', () => {
        renderWithTheme(<PostCard post={toPostCard(post)} />)

        const link = screen.getByRole('link', { name: 'Ler post: Matemática Básica' })

        expect(link).toHaveAttribute('href', '/posts/7')
    })

    it('clamps the excerpt to two lines with css, not javascript', () => {
        renderWithTheme(<PostCard post={toPostCard(post)} />)

        const injectedCss = Array.from(document.querySelectorAll('style'))
            .map((tag) => tag.textContent ?? '')
            .join('')

        expect(injectedCss).toContain('-webkit-line-clamp:2')

        expect(screen.getByText(/Primeiro parágrafo/)).toBeInTheDocument()
    })

    it('flattens the newlines so the excerpt is a single run of text', () => {
        const card = toPostCard(post)

        expect(card.excerpt).not.toContain('\n')
        expect(card.excerpt).toContain('Primeiro parágrafo do conteúdo. Segundo parágrafo')
    })

    it('normalizes the search text so accents do not matter', () => {
        const card = toPostCard(post)

        expect(card.searchText).toContain('matematica basica')
    })
})
