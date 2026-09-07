const COLOR_NAMES = [
    'brand',
    'brandHover',
    'brandSubtle',
    'accent',
    'text',
    'textMuted',
    'textInverse',
    'surface',
    'surfaceAlt',
    'border',
    'borderStrong',
    'focus',
    'success',
    'successSubtle',
    'warning',
    'warningSubtle',
    'danger',
    'dangerHover',
    'dangerSubtle',
    'overlay',
] as const

const SHADOW_NAMES = ['sm', 'md', 'lg'] as const

export type ThemeColorName = (typeof COLOR_NAMES)[number]
export type ThemeShadowName = (typeof SHADOW_NAMES)[number]

export type ThemePalette = Record<ThemeColorName, string>
export type ThemeShadows = Record<ThemeShadowName, string>

/** Os valores concretos que mudam entre claro e escuro. O resto do tema e igual nos dois. */
export interface ThemeSkin {
    colors: ThemePalette
    shadows: ThemeShadows
}

export const lightSkin: ThemeSkin = {
    colors: {
        brand: '#1B4F9C',
        brandHover: '#153F7D',
        brandSubtle: '#E8F0FB',
        accent: '#8A5A00',
        text: '#14181F',
        textMuted: '#4E5766',
        textInverse: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceAlt: '#F5F7FA',
        border: '#D5DBE3',
        borderStrong: '#9AA4B2',
        focus: '#0B63CE',
        success: '#1B7F4B',
        successSubtle: '#E6F4EC',
        warning: '#8A5A00',
        warningSubtle: '#FDF3E2',
        danger: '#B3261E',
        dangerHover: '#8F1D17',
        dangerSubtle: '#FBEAE9',
        overlay: 'rgba(20, 24, 31, 0.5)',
    },
    shadows: {
        sm: '0 1px 2px rgba(20, 24, 31, 0.08)',
        md: '0 4px 12px rgba(20, 24, 31, 0.10)',
        lg: '0 12px 32px rgba(20, 24, 31, 0.16)',
    },
}

/*
 * No escuro os papeis se invertem: `brand` e `danger` viram cores claras (funcionam como
 * texto sobre fundo escuro) e `textInverse` vira escuro, porque agora ele e o texto que
 * fica por cima desses fundos claros nos botoes.
 */
export const darkSkin: ThemeSkin = {
    colors: {
        brand: '#79B0FF',
        brandHover: '#9CC6FF',
        brandSubtle: '#17263D',
        accent: '#E3A857',
        text: '#E8ECF3',
        textMuted: '#A7B0BE',
        textInverse: '#0B1017',
        surface: '#161B22',
        surfaceAlt: '#0D1117',
        border: '#2A313B',
        borderStrong: '#4A5462',
        focus: '#8CC2FF',
        success: '#5DD39E',
        successSubtle: '#10281E',
        warning: '#E3A857',
        warningSubtle: '#2E2213',
        danger: '#FF8A80',
        dangerHover: '#FFA9A1',
        dangerSubtle: '#2E1917',
        overlay: 'rgba(3, 6, 10, 0.7)',
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        md: '0 4px 12px rgba(0, 0, 0, 0.55)',
        lg: '0 12px 32px rgba(0, 0, 0, 0.65)',
    },
}

const toKebabCase = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

export const colorVarName = (name: ThemeColorName) => `--color-${toKebabCase(name)}`
export const shadowVarName = (name: ThemeShadowName) => `--shadow-${name}`

/** Declaracoes CSS de uma pele, para o GlobalStyles publicar em `:root`. */
export function skinToCssVars(skin: ThemeSkin) {
    return [
        ...COLOR_NAMES.map((name) => `${colorVarName(name)}: ${skin.colors[name]};`),
        ...SHADOW_NAMES.map((name) => `${shadowVarName(name)}: ${skin.shadows[name]};`),
    ].join('\n            ')
}

/*
 * O tema entregue ao styled-components aponta sempre para as variaveis CSS, nunca para o
 * hex direto. Trocar de modo vira uma troca de atributo no <html>: nada re-renderiza,
 * nao ha flash na hidratacao e todo componente existente continua lendo `theme.colors.*`.
 */
const colorVars = Object.fromEntries(
    COLOR_NAMES.map((name) => [name, `var(${colorVarName(name)})`]),
) as ThemePalette

const shadowVars = Object.fromEntries(
    SHADOW_NAMES.map((name) => [name, `var(${shadowVarName(name)})`]),
) as ThemeShadows

const tokens = {
    spacing: (steps: number) => `${steps * 4}px`,
    radii: { sm: '4px', md: '8px', lg: '16px', pill: '999px' },
    typography: {
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.375rem',
            '2xl': '1.75rem',
            '3xl': '2.25rem',
        },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { tight: 1.25, base: 1.5, relaxed: 1.65 },
    },
    breakpoints: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px' },
    layout: { maxWidth: '1120px', readableWidth: '68ch', headerHeight: '64px' },
    transitions: { fast: '120ms ease', base: '200ms ease' },
    zIndex: { header: 100, dialog: 400, toast: 500 },
} as const

export const theme = {
    colors: colorVars,
    shadows: shadowVars,
    ...tokens,
}

export type AppTheme = typeof theme
