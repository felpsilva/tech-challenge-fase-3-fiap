import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '@/test/render-with-theme'
import { CategoryForm } from './category-form'

jest.mock('@/lib/api/category-service', () => ({
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
}))

describe('CategoryForm', () => {
    it('fills the slug from the name while it was not touched', async () => {
        const user = userEvent.setup()
        renderWithTheme(<CategoryForm mode="create" />)

        await user.type(screen.getByLabelText(/Nome/), 'Matemática Aplicada')

        await waitFor(() => {
            expect(screen.getByLabelText(/^Slug/)).toHaveValue('matematica-aplicada')
        })
    })

    it('stops overwriting the slug after a manual edit', async () => {
        const user = userEvent.setup()
        renderWithTheme(<CategoryForm mode="create" />)

        const nameInput = screen.getByLabelText(/Nome/)
        const slugInput = screen.getByLabelText(/^Slug/)

        await user.type(nameInput, 'Física')
        await waitFor(() => expect(slugInput).toHaveValue('fisica'))

        await user.clear(slugInput)
        await user.type(slugInput, 'fisica-2027')

        // Mexer no título depois disso não pode desfazer o slug escolhido.
        await user.type(nameInput, ' Moderna')

        await waitFor(() => expect(nameInput).toHaveValue('Física Moderna'))
        expect(slugInput).toHaveValue('fisica-2027')
    })

    it('shows a validation error when the name is empty', async () => {
        const user = userEvent.setup()
        renderWithTheme(<CategoryForm mode="create" />)

        await user.click(screen.getByRole('button', { name: 'Criar categoria' }))

        expect(await screen.findByText('Informe o nome da categoria.')).toBeInTheDocument()
    })

    it('ties each error to its field for assistive technology', async () => {
        const user = userEvent.setup()
        renderWithTheme(<CategoryForm mode="create" />)

        await user.click(screen.getByRole('button', { name: 'Criar categoria' }))

        const nameInput = await screen.findByLabelText(/Nome/)

        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
        expect(nameInput).toHaveAttribute('aria-describedby', expect.stringContaining('field-name-error'))
    })
})
