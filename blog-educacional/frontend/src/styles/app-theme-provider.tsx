'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './global-styles'
import { ThemeModeProvider } from './theme-mode-context'
import { theme } from './theme'

export function AppThemeProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <ThemeModeProvider>{children}</ThemeModeProvider>
        </ThemeProvider>
    )
}
