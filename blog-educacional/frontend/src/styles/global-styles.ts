'use client'

import { createGlobalStyle } from 'styled-components'
import { reducedMotion } from './media'
import { darkSkin, lightSkin, skinToCssVars } from './theme'
import { DARK_MEDIA_QUERY, THEME_ATTRIBUTE } from './theme-mode'

/*
 * A paleta clara e o padrao. A escura entra por dois caminhos:
 * 1. media query, para quem chega sem JavaScript ou antes do script inicial rodar;
 * 2. atributo data-theme no <html>, escrito pelo script inicial e pelo ThemeModeProvider,
 *    que tem a ultima palavra quando a pessoa escolheu um modo explicito.
 */
export const GlobalStyles = createGlobalStyle`
    :root {
        color-scheme: light;
        ${skinToCssVars(lightSkin)}
    }

    @media ${DARK_MEDIA_QUERY} {
        :root:not([${THEME_ATTRIBUTE}='light']) {
            color-scheme: dark;
            ${skinToCssVars(darkSkin)}
        }
    }

    :root[${THEME_ATTRIBUTE}='dark'] {
        color-scheme: dark;
        ${skinToCssVars(darkSkin)}
    }

    *, *::before, *::after { box-sizing: border-box; }
    * { margin: 0; }

    html { -webkit-text-size-adjust: 100%; }

    body {
        min-height: 100dvh;
        font-family: ${({ theme }) => theme.typography.fontFamily};
        font-size: ${({ theme }) => theme.typography.sizes.md};
        line-height: ${({ theme }) => theme.typography.lineHeights.base};
        color: ${({ theme }) => theme.colors.text};
        background: ${({ theme }) => theme.colors.surfaceAlt};
        -webkit-font-smoothing: antialiased;
    }

    img, picture, svg, video { display: block; max-width: 100%; }

    input, button, textarea, select {
        font: inherit;
        color: inherit;
        /* 1rem no minimo: abaixo disso o iOS da zoom no foco do campo. */
        font-size: max(1rem, ${({ theme }) => theme.typography.sizes.md});
    }

    :focus-visible {
        outline: 3px solid ${({ theme }) => theme.colors.focus};
        outline-offset: 2px;
        border-radius: 2px;
    }

    :focus:not(:focus-visible) { outline: none; }

    a {
        color: ${({ theme }) => theme.colors.brand};
        text-underline-offset: 2px;
    }

    h1, h2, h3, h4 {
        line-height: ${({ theme }) => theme.typography.lineHeights.tight};
        text-wrap: balance;
    }

    p { text-wrap: pretty; }

    ul, ol { padding-left: ${({ theme }) => theme.spacing(5)}; }

    ${reducedMotion} {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }
`
