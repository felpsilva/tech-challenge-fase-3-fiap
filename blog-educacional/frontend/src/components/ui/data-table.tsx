'use client'

import styled from 'styled-components'
import { upTo, visuallyHiddenCss } from '@/styles/media'

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    caption {
        ${visuallyHiddenCss}
    }

    th, td {
        padding: ${({ theme }) => theme.spacing(3)};
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        vertical-align: middle;
    }

    th {
        font-size: ${({ theme }) => theme.typography.sizes.xs};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: ${({ theme }) => theme.colors.textMuted};
    }

    ${upTo('md')} {
        thead {
            ${visuallyHiddenCss}
        }

        tbody, tr, td {
            display: block;
        }

        tr {
            margin-bottom: ${({ theme }) => theme.spacing(4)};
            border: 1px solid ${({ theme }) => theme.colors.border};
            border-radius: ${({ theme }) => theme.radii.md};
            background: ${({ theme }) => theme.colors.surface};
            overflow: hidden;
        }

        td {
            display: grid;
            grid-template-columns: minmax(88px, 35%) 1fr;
            gap: ${({ theme }) => theme.spacing(2)};
            align-items: baseline;
            border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceAlt};
        }

        td:last-child {
            border-bottom: 0;
        }

        td::before {
            content: attr(data-label);
            font-size: ${({ theme }) => theme.typography.sizes.xs};
            font-weight: ${({ theme }) => theme.typography.weights.semibold};
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: ${({ theme }) => theme.colors.textMuted};
        }
    }
`

export const TableWrapper = styled.div`
    overflow-x: auto;
`

export const RowActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(2)};
`
