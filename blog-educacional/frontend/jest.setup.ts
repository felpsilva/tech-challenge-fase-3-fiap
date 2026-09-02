import '@testing-library/jest-dom'

// Os hooks de navegacao do App Router explodem fora do runtime do Next. Este
// mock e o que impede o primeiro teste de componente de falhar sem motivo
// aparente.
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
