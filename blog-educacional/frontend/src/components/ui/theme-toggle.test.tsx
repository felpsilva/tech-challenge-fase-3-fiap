import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '@/test/render-with-theme'
import { mockMatchMedia } from '@/test/match-media'
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from '@/styles/theme-mode'
import { ThemeToggle } from './theme-toggle'

const toggle = () => screen.getByRole('button', { name: 'Modo escuro' })

describe('ThemeToggle', () => {
    it('starts unpressed and paints light when the system prefers light', () => {
        renderWithTheme(<ThemeToggle />)

        expect(toggle()).toHaveAttribute('aria-pressed', 'false')
        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
    })

    it('starts pressed and paints dark when the system prefers dark', () => {
        mockMatchMedia(true)

        renderWithTheme(<ThemeToggle />)

        expect(toggle()).toHaveAttribute('aria-pressed', 'true')
        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    })

    it('switches to dark on click and remembers the choice', async () => {
        const user = userEvent.setup()

        renderWithTheme(<ThemeToggle />)

        await user.click(toggle())

        expect(toggle()).toHaveAttribute('aria-pressed', 'true')
        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('switches back to light on a second click', async () => {
        const user = userEvent.setup()

        renderWithTheme(<ThemeToggle />)

        await user.click(toggle())
        await user.click(toggle())

        expect(toggle()).toHaveAttribute('aria-pressed', 'false')
        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })

    it('honours a choice saved in a previous visit over the system preference', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
        mockMatchMedia(true)

        renderWithTheme(<ThemeToggle />)

        expect(toggle()).toHaveAttribute('aria-pressed', 'false')
        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
    })

    it('follows the system when it changes and no explicit choice was made', () => {
        const media = mockMatchMedia(false)

        renderWithTheme(<ThemeToggle />)

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')

        act(() => media.setPrefersDark(true))

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    })

    it('ignores the system after an explicit choice', async () => {
        const user = userEvent.setup()
        const media = mockMatchMedia(false)

        renderWithTheme(<ThemeToggle />)

        await user.click(toggle())
        act(() => media.setPrefersDark(false))

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    })

    /*
     * O icone troca por CSS olhando o data-theme, e nao por estado do React: e isso que faz
     * o sol/lua aparecer certo ja na primeira pintura, antes da hidratacao.
     */
    it('swaps the sun and moon icons through css, not react state', () => {
        renderWithTheme(<ThemeToggle />)

        const injectedCss = Array.from(document.querySelectorAll('style'))
            .map((tag) => tag.textContent ?? '')
            .join('')

        expect(injectedCss).toContain(`[${THEME_ATTRIBUTE}='dark']`)
    })
})
