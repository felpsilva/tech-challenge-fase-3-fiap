import {
    DARK_MEDIA_QUERY,
    DEFAULT_THEME_MODE,
    THEME_ATTRIBUTE,
    THEME_STORAGE_KEY,
    applyThemeMode,
    isThemeMode,
    readStoredThemeMode,
    readSystemThemeMode,
    resolveThemeMode,
    themeInitScript,
    writeStoredThemeMode,
} from './theme-mode'
import { mockMatchMedia } from '@/test/match-media'

describe('isThemeMode', () => {
    it('accepts the three supported modes', () => {
        expect(isThemeMode('light')).toBe(true)
        expect(isThemeMode('dark')).toBe(true)
        expect(isThemeMode('system')).toBe(true)
    })

    it('rejects anything else, including a missing value', () => {
        expect(isThemeMode(null)).toBe(false)
        expect(isThemeMode('DARK')).toBe(false)
        expect(isThemeMode('sepia')).toBe(false)
    })
})

describe('resolveThemeMode', () => {
    it('keeps an explicit choice even when the system disagrees', () => {
        expect(resolveThemeMode('light', 'dark')).toBe('light')
        expect(resolveThemeMode('dark', 'light')).toBe('dark')
    })

    it('follows the system when the mode is system', () => {
        expect(resolveThemeMode('system', 'dark')).toBe('dark')
        expect(resolveThemeMode('system', 'light')).toBe('light')
    })
})

describe('readStoredThemeMode', () => {
    it('defaults to system when nothing was saved', () => {
        expect(readStoredThemeMode()).toBe(DEFAULT_THEME_MODE)
        expect(DEFAULT_THEME_MODE).toBe('system')
    })

    it('reads back what was written', () => {
        writeStoredThemeMode('dark')

        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
        expect(readStoredThemeMode()).toBe('dark')
    })

    it('falls back to the default when the stored value is garbage', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'neon')

        expect(readStoredThemeMode()).toBe(DEFAULT_THEME_MODE)
    })

    it('survives a browser that blocks storage', () => {
        const blocked = {
            getItem: () => {
                throw new Error('storage disabled')
            },
            setItem: () => {
                throw new Error('storage disabled')
            },
        } as unknown as Storage

        expect(readStoredThemeMode(blocked)).toBe(DEFAULT_THEME_MODE)
        expect(() => writeStoredThemeMode('dark', blocked)).not.toThrow()
    })
})

describe('readSystemThemeMode', () => {
    it('reports dark when the system prefers dark', () => {
        mockMatchMedia(true)

        expect(readSystemThemeMode()).toBe('dark')
    })

    it('reports light when the system prefers light', () => {
        mockMatchMedia(false)

        expect(readSystemThemeMode()).toBe('light')
    })
})

describe('applyThemeMode', () => {
    it('writes the mode onto the root element', () => {
        applyThemeMode('dark')

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')

        applyThemeMode('light')

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
    })
})

describe('themeInitScript', () => {
    /*
     * O script e uma string avulsa injetada no HTML: se a chave de storage, o atributo ou a
     * media query mudarem no modulo e nao nele, o tema volta a piscar na primeira pintura.
     */
    it('uses the same storage key, attribute and media query as the module', () => {
        expect(themeInitScript).toContain(JSON.stringify(THEME_STORAGE_KEY))
        expect(themeInitScript).toContain(JSON.stringify(THEME_ATTRIBUTE))
        expect(themeInitScript).toContain(JSON.stringify(DARK_MEDIA_QUERY))
    })

    it('applies the stored choice before the first paint', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
        mockMatchMedia(false)

        eval(themeInitScript)

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    })

    it('falls back to the system preference when the choice is system', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'system')
        mockMatchMedia(true)

        eval(themeInitScript)

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    })

    it('lands on light when nothing is stored and the system prefers light', () => {
        mockMatchMedia(false)

        eval(themeInitScript)

        expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
    })
})
