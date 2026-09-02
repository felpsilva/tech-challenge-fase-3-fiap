'use client'

import styled, { css } from 'styled-components'

type Tone = 'info' | 'success' | 'warning' | 'danger'

const tones = {
    info: css`
        border-color: ${({ theme }) => theme.colors.border};
        background: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text};
    `,
    success: css`
        border-color: ${({ theme }) => theme.colors.success};
        background: ${({ theme }) => theme.colors.successSubtle};
        color: ${({ theme }) => theme.colors.success};
    `,
    warning: css`
        border-color: ${({ theme }) => theme.colors.warning};
        background: ${({ theme }) => theme.colors.warningSubtle};
        color: ${({ theme }) => theme.colors.warning};
    `,
    danger: css`
        border-color: ${({ theme }) => theme.colors.danger};
        background: ${({ theme }) => theme.colors.dangerSubtle};
        color: ${({ theme }) => theme.colors.danger};
    `,
} satisfies Record<Tone, ReturnType<typeof css>>

export const Feedback = styled.div<{ $tone?: Tone }>`
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
    border: 1px solid;
    border-left-width: 4px;
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.typography.sizes.sm};

    ${({ $tone = 'info' }) => tones[$tone]}
`

export const EmptyState = styled.div`
    padding: ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(4)};
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
    background: ${({ theme }) => theme.colors.surface};
    text-align: center;
    color: ${({ theme }) => theme.colors.textMuted};
`
