/**
 * Tokens de design. Os pares de cor de texto foram checados contra
 * `surface` (#FFFFFF) e `surfaceAlt` (#F5F7FA) para ficarem acima de 4.5:1 —
 * mexer nos valores exige checar o contraste de novo.
 */
export const theme = {
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
    },
    // Escala de 4px: spacing(3) === '12px'.
    spacing: (steps: number) => `${steps * 4}px`,
    radii: { sm: '4px', md: '8px', lg: '16px', pill: '999px' },
    shadows: {
        sm: '0 1px 2px rgba(20, 24, 31, 0.08)',
        md: '0 4px 12px rgba(20, 24, 31, 0.10)',
        lg: '0 12px 32px rgba(20, 24, 31, 0.16)',
    },
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

export type AppTheme = typeof theme
