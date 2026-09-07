import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { ThemeModeProvider } from '@/styles/theme-mode-context'
import { theme } from '@/styles/theme'

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <ThemeModeProvider>{children}</ThemeModeProvider>
        </ThemeProvider>
    )
}

export function renderWithTheme(ui: ReactElement) {
    return render(ui, { wrapper: Wrapper })
}
