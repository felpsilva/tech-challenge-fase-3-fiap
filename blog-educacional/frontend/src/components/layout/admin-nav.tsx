'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styled from 'styled-components'
import { useAuth } from '@/lib/auth/auth-context'
import { canManageUsers } from '@/types/permissions'

const LINKS = [
    { href: '/admin/posts', label: 'Posts' },
    { href: '/admin/categories', label: 'Categorias' },
]

export function AdminNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    const links = canManageUsers(user?.permission ?? '')
        ? [...LINKS, { href: '/admin/users', label: 'Usuários' }]
        : LINKS

    return (
        <Nav aria-label="Navegação da administração">
            <List>
                {links.map((link) => {
                    const isCurrent = pathname === link.href || pathname.startsWith(`${link.href}/`)

                    return (
                        <li key={link.href}>
                            <NavLink
                                href={link.href}
                                $current={isCurrent}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    )
                })}
            </List>
        </Nav>
    )
}

const Nav = styled.nav`
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const List = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: 0;
    list-style: none;
`

const NavLink = styled(Link) <{ $current: boolean }>`
    display: inline-block;
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
    border-bottom: 3px solid
        ${({ theme, $current }) => ($current ? theme.colors.brand : 'transparent')};
    color: ${({ theme, $current }) => ($current ? theme.colors.brand : theme.colors.textMuted)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    text-decoration: none;

    &:hover {
        color: ${({ theme }) => theme.colors.brand};
    }
`
