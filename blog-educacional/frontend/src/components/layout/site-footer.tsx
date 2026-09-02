'use client'

import styled from 'styled-components'

export function SiteFooter() {
    return (
        <Footer>
            <Inner>
                <p>Blog Educacional · Tech Challenge FIAP</p>
            </Inner>
        </Footer>
    )
}

const Footer = styled.footer`
    margin-top: auto;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
`

const Inner = styled.div`
    max-width: ${({ theme }) => theme.layout.maxWidth};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(4)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
`
