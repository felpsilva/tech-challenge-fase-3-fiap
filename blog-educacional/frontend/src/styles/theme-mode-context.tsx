'use client'

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import {
    DARK_MEDIA_QUERY,
    DEFAULT_THEME_MODE,
    applyThemeMode,
    readStoredThemeMode,
    readSystemThemeMode,
    resolveThemeMode,
    writeStoredThemeMode,
    type ResolvedThemeMode,
    type ThemeMode,
} from './theme-mode'

interface ThemeModeState {
    /** A escolha da pessoa: `light`, `dark` ou `system`. */
    mode: ThemeMode
    /** O modo efetivamente pintado. */
    resolvedMode: ResolvedThemeMode
    setMode: (mode: ThemeMode) => void
    toggle: () => void
}

const ThemeModeContext = createContext<ThemeModeState | null>(null)

export function ThemeModeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE)
    const [systemMode, setSystemMode] = useState<ResolvedThemeMode>('light')

    // Le a escolha salva so no cliente: no servidor nao ha localStorage nem matchMedia.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModeState(readStoredThemeMode())
        setSystemMode(readSystemThemeMode())
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return
        }

        const query = window.matchMedia(DARK_MEDIA_QUERY)
        const sync = (event: MediaQueryListEvent) => setSystemMode(event.matches ? 'dark' : 'light')

        query.addEventListener('change', sync)

        return () => query.removeEventListener('change', sync)
    }, [])

    const resolvedMode = resolveThemeMode(mode, systemMode)

    useEffect(() => {
        applyThemeMode(resolvedMode)
    }, [resolvedMode])

    const setMode = useCallback((next: ThemeMode) => {
        setModeState(next)
        writeStoredThemeMode(next)
    }, [])

    const toggle = useCallback(() => {
        setMode(resolvedMode === 'dark' ? 'light' : 'dark')
    }, [resolvedMode, setMode])

    const value = useMemo<ThemeModeState>(
        () => ({ mode, resolvedMode, setMode, toggle }),
        [mode, resolvedMode, setMode, toggle],
    )

    return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
}

export function useThemeMode() {
    const context = useContext(ThemeModeContext)

    if (!context) {
        throw new Error('useThemeMode precisa estar dentro de ThemeModeProvider')
    }

    return context
}
