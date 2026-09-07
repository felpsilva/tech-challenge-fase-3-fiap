export const THEME_STORAGE_KEY = 'blog-educacional:theme'
export const THEME_ATTRIBUTE = 'data-theme'
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

/** O que esta pintado na tela agora. */
export type ResolvedThemeMode = 'light' | 'dark'

/** O que a pessoa escolheu. `system` segue a preferencia do sistema operacional. */
export type ThemeMode = ResolvedThemeMode | 'system'

export const DEFAULT_THEME_MODE: ThemeMode = 'system'

export function isResolvedThemeMode(value: unknown): value is ResolvedThemeMode {
    return value === 'light' || value === 'dark'
}

export function isThemeMode(value: unknown): value is ThemeMode {
    return isResolvedThemeMode(value) || value === 'system'
}

export function resolveThemeMode(mode: ThemeMode, systemMode: ResolvedThemeMode): ResolvedThemeMode {
    return mode === 'system' ? systemMode : mode
}

function safeStorage(): Storage | null {
    try {
        return typeof window === 'undefined' ? null : window.localStorage
    } catch {
        // Navegador com armazenamento bloqueado: o tema so nao persiste entre visitas.
        return null
    }
}

export function readStoredThemeMode(storage: Storage | null = safeStorage()): ThemeMode {
    try {
        const stored = storage?.getItem(THEME_STORAGE_KEY)

        return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE
    } catch {
        return DEFAULT_THEME_MODE
    }
}

export function writeStoredThemeMode(mode: ThemeMode, storage: Storage | null = safeStorage()) {
    try {
        storage?.setItem(THEME_STORAGE_KEY, mode)
    } catch {
        // Sem persistencia disponivel; a escolha vale so para esta sessao.
    }
}

export function readSystemThemeMode(): ResolvedThemeMode {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'light'
    }

    return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'
}

export function applyThemeMode(mode: ResolvedThemeMode, root?: HTMLElement) {
    const element = root ?? (typeof document === 'undefined' ? null : document.documentElement)

    element?.setAttribute(THEME_ATTRIBUTE, mode)
}

/*
 * Roda antes da primeira pintura para o <html> ja nascer com o atributo certo. Sem isso o
 * usuario de tema escuro veria um lampejo claro ate o React hidratar. Fica em uma unica
 * linha, com as mesmas constantes do modulo, para nao haver deriva entre script e app.
 */
export const themeInitScript = [
    '(function(){try{',
    `var stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});`,
    "var mode=stored==='light'||stored==='dark'?stored",
    `:(window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches?'dark':'light');`,
    `document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},mode);`,
    '}catch(e){}})();',
].join('')
