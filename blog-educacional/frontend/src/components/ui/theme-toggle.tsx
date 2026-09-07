'use client'

import styled from 'styled-components'
import { from, visuallyHiddenCss } from '@/styles/media'
import { THEME_ATTRIBUTE } from '@/styles/theme-mode'
import { useThemeMode } from '@/styles/theme-mode-context'

export function ThemeToggle() {
    const { resolvedMode, toggle } = useThemeMode()

    return (
        <Toggle
            type="button"
            onClick={toggle}
            aria-pressed={resolvedMode === 'dark'}
            title="Alternar entre tema claro e escuro"
        >
            <SunIcon viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
            </SunIcon>

            <MoonIcon viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
            </MoonIcon>

            <Label>Modo escuro</Label>
        </Toggle>
    )
}

const Toggle = styled.button`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.pill};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    cursor: pointer;
    transition: background ${({ theme }) => theme.transitions.fast},
        border-color ${({ theme }) => theme.transitions.fast};

    &:hover {
        background: ${({ theme }) => theme.colors.brandSubtle};
        border-color: ${({ theme }) => theme.colors.borderStrong};
        color: ${({ theme }) => theme.colors.brand};
    }
`

/*
 * Os icones trocam por CSS, olhando o data-theme do <html>, e nao por estado do React:
 * assim o icone certo ja aparece na primeira pintura, antes da hidratacao. O rotulo e o
 * aria-pressed cuidam do significado para leitores de tela.
 */
const Icon = styled.svg`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
`

const SunIcon = styled(Icon)`
    display: block;

    [${THEME_ATTRIBUTE}='dark'] & {
        display: none;
    }
`

const MoonIcon = styled(Icon)`
    display: none;

    [${THEME_ATTRIBUTE}='dark'] & {
        display: block;
    }
`

const Label = styled.span`
    ${visuallyHiddenCss}

    ${from('lg')} {
        position: static;
        width: auto;
        height: auto;
        margin: 0;
        overflow: visible;
        clip-path: none;
        white-space: nowrap;
    }
`
