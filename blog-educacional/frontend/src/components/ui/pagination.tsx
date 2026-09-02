'use client'

import styled from 'styled-components'
import { Button } from './button'

interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) {
        return null
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

    return (
        <Nav aria-label="Paginação dos posts">
            <Button
                type="button"
                $variant="secondary"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
            >
                Anterior
            </Button>

            <PageList>
                {pages.map((item) => (
                    <li key={item}>
                        <Button
                            type="button"
                            $variant={item === page ? 'primary' : 'secondary'}
                            aria-current={item === page ? 'page' : undefined}
                            aria-label={`Página ${item}`}
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </Button>
                    </li>
                ))}
            </PageList>

            <Button
                type="button"
                $variant="secondary"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
            >
                Próxima
            </Button>
        </Nav>
    )
}

const Nav = styled.nav`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(8)};
`

const PageList = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: 0;
    list-style: none;
`
