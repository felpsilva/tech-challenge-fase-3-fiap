'use client'

import styled from 'styled-components'
import { from } from '@/styles/media'

export const PageContainer = styled.div`
    width: 100%;
    max-width: ${({ theme }) => theme.layout.maxWidth};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(4)};

    ${from('md')} {
        padding: ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(6)};
    }
`

export const PageHeader = styled.header`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(6)};

    ${from('md')} {
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
    }
`

export const PageTitle = styled.h1`
    font-size: ${({ theme }) => theme.typography.sizes['2xl']};

    ${from('md')} {
        font-size: ${({ theme }) => theme.typography.sizes['3xl']};
    }
`

export const PageDescription = styled.p`
    color: ${({ theme }) => theme.colors.textMuted};
`

export const Card = styled.section`
    padding: ${({ theme }) => theme.spacing(5)};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.sm};
`
