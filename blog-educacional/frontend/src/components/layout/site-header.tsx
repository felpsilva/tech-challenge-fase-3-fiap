'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { from } from '@/styles/media'
import { useAuth } from '@/lib/auth/auth-context'
import { canAccessPanel } from '@/types/permissions'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
    const { user, isReady, signOut } = useAuth()

    return (
        <Header>
            <Inner>
                <Brand href="/">
                    Blog Educacional
                </Brand>

                <Nav aria-label="Navegação principal">
                    <Link href="/">Posts</Link>

                    {/* Largura reservada até o cookie ser lido: sem isso a
                        barra "salta" no primeiro render do cliente. */}
                    {!isReady && <Placeholder aria-hidden="true" />}

                    {isReady && !user && <Link href="/login">Entrar</Link>}

                    {isReady && user && (
                        <>
                            {canAccessPanel(user.permission) && (
                                <Link href="/admin/posts">Painel</Link>
                            )}
                            <UserName>{user.username}</UserName>
                            <Button type="button" $variant="ghost" onClick={() => signOut('manual')}>
                                Sair
                            </Button>
                        </>
                    )}
                </Nav>
            </Inner>
        </Header>
    )
}

const Header = styled.header`
    position: sticky;
    top: 0;
    z-index: ${({ theme }) => theme.zIndex.header};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
`

const Inner = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
    max-width: ${({ theme }) => theme.layout.maxWidth};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};

    ${from('md')} {
        padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(6)};
    }
`

const Brand = styled(Link)`
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    color: ${({ theme }) => theme.colors.brand};
    text-decoration: none;
`

const Nav = styled.nav`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(4)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const Placeholder = styled.span`
    display: inline-block;
    width: 96px;
    height: 20px;
`

const UserName = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};
`
