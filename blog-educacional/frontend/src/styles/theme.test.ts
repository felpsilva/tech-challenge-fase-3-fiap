import { darkSkin, lightSkin, skinToCssVars, theme } from './theme'

describe('theme skins', () => {
    it('defines the same tokens in light and dark', () => {
        expect(Object.keys(darkSkin.colors).sort()).toEqual(Object.keys(lightSkin.colors).sort())
        expect(Object.keys(darkSkin.shadows).sort()).toEqual(Object.keys(lightSkin.shadows).sort())
    })

    it('never repeats a light color in the dark palette', () => {
        const shared = Object.keys(lightSkin.colors).filter(
            (name) =>
                lightSkin.colors[name as keyof typeof lightSkin.colors] ===
                darkSkin.colors[name as keyof typeof darkSkin.colors],
        )

        expect(shared).toEqual([])
    })

    /*
     * O tema entregue ao styled-components so pode conter variaveis CSS: um hex fixo aqui
     * congelaria aquela cor no modo claro para todos os componentes.
     */
    it('exposes every color and shadow as a css variable', () => {
        Object.values(theme.colors).forEach((value) => {
            expect(value).toMatch(/^var\(--color-[a-z-]+\)$/)
        })

        Object.values(theme.shadows).forEach((value) => {
            expect(value).toMatch(/^var\(--shadow-[a-z]+\)$/)
        })
    })

    it('names the variables in kebab-case', () => {
        expect(theme.colors.brandHover).toBe('var(--color-brand-hover)')
        expect(theme.colors.surfaceAlt).toBe('var(--color-surface-alt)')
    })
})

describe('skinToCssVars', () => {
    it('declares every token of the skin', () => {
        const css = skinToCssVars(darkSkin)

        expect(css).toContain(`--color-surface: ${darkSkin.colors.surface};`)
        expect(css).toContain(`--color-brand-hover: ${darkSkin.colors.brandHover};`)
        expect(css).toContain(`--shadow-lg: ${darkSkin.shadows.lg};`)
    })
})
