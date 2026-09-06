'use client'

import styled, { css } from 'styled-components'

const controlBase = css`
    width: 100%;
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    transition: border-color ${({ theme }) => theme.transitions.fast};

    &:hover:not(:disabled) {
        border-color: ${({ theme }) => theme.colors.borderStrong};
    }

    &[aria-invalid='true'] {
        border-color: ${({ theme }) => theme.colors.danger};
    }

    &:disabled {
        background: ${({ theme }) => theme.colors.surfaceAlt};
        color: ${({ theme }) => theme.colors.textMuted};
        cursor: not-allowed;
    }
`

export const TextInput = styled.input`
    ${controlBase}
`

export const TextArea = styled.textarea`
    ${controlBase}
    min-height: 220px;
    resize: vertical;
    line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`

export const Select = styled.select`
    ${controlBase}
    cursor: pointer;
`
