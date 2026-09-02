'use client'

import styled, { css } from 'styled-components'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants = {
    primary: css`
        background: ${({ theme }) => theme.colors.brand};
        color: ${({ theme }) => theme.colors.textInverse};
        border-color: ${({ theme }) => theme.colors.brand};

        &:hover:not(:disabled) {
            background: ${({ theme }) => theme.colors.brandHover};
            border-color: ${({ theme }) => theme.colors.brandHover};
        }
    `,
    secondary: css`
        background: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.brand};
        border-color: ${({ theme }) => theme.colors.border};

        &:hover:not(:disabled) {
            background: ${({ theme }) => theme.colors.brandSubtle};
        }
    `,
    danger: css`
        background: ${({ theme }) => theme.colors.danger};
        color: ${({ theme }) => theme.colors.textInverse};
        border-color: ${({ theme }) => theme.colors.danger};

        &:hover:not(:disabled) {
            background: ${({ theme }) => theme.colors.dangerHover};
            border-color: ${({ theme }) => theme.colors.dangerHover};
        }
    `,
    ghost: css`
        background: transparent;
        color: ${({ theme }) => theme.colors.brand};
        border-color: transparent;
        text-decoration: underline;

        &:hover:not(:disabled) {
            background: ${({ theme }) => theme.colors.brandSubtle};
        }
    `,
} satisfies Record<Variant, ReturnType<typeof css>>

export const Button = styled.button<{ $variant?: Variant }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(2)};
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
    border: 1px solid transparent;
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    cursor: pointer;
    transition: background ${({ theme }) => theme.transitions.fast};

    ${({ $variant = 'primary' }) => variants[$variant]}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`

export const LinkButton = styled(Button).attrs({ as: 'a' })`
    text-decoration: none;
`
