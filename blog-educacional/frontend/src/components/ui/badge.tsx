'use client'

import styled, { css } from 'styled-components'

type Tone = 'neutral' | 'success' | 'warning'

const tones = {
    neutral: css`
        background: ${({ theme }) => theme.colors.brandSubtle};
        color: ${({ theme }) => theme.colors.brand};
    `,
    success: css`
        background: ${({ theme }) => theme.colors.successSubtle};
        color: ${({ theme }) => theme.colors.success};
    `,
    warning: css`
        background: ${({ theme }) => theme.colors.warningSubtle};
        color: ${({ theme }) => theme.colors.warning};
    `,
} satisfies Record<Tone, ReturnType<typeof css>>

// Sempre com texto dentro: a cor e reforco, nunca a unica informacao.
export const Badge = styled.span<{ $tone?: Tone }>`
    display: inline-flex;
    align-items: center;
    padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
    border-radius: ${({ theme }) => theme.radii.pill};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    white-space: nowrap;

    ${({ $tone = 'neutral' }) => tones[$tone]}
`
