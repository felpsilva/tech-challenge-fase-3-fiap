import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/styles/theme'

function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

/** Todo componente estilizado precisa do tema no contexto para renderizar. */
export function renderWithTheme(ui: ReactElement) {
    return render(ui, { wrapper: Wrapper })
}
