import { theme } from './theme'

type Breakpoint = keyof typeof theme.breakpoints

export const from = (breakpoint: Breakpoint) =>
    `@media (min-width: ${theme.breakpoints[breakpoint]})`

export const upTo = (breakpoint: Breakpoint) =>
    `@media (max-width: calc(${theme.breakpoints[breakpoint]} - 1px))`

export const reducedMotion = '@media (prefers-reduced-motion: reduce)'

export const visuallyHiddenCss = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
`
