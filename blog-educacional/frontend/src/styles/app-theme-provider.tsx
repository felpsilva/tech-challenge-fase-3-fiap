'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './global-styles'
import { theme } from './theme'

export function AppThemeProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {children}
        </ThemeProvider>
    )
}
