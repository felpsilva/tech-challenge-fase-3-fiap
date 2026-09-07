import '@testing-library/jest-dom'
import { mockMatchMedia } from '@/test/match-media'

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    notFound: jest.fn(),
    redirect: jest.fn(),
}))

// Todo render passa pelo ThemeModeProvider, que consulta a preferencia de cor do sistema.
// Alguns testes rodam no ambiente node (`@jest-environment node`) e nao tem window.
beforeEach(() => {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    mockMatchMedia(false)
})
