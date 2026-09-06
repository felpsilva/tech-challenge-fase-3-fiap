'use client'

import styled from 'styled-components'

export function SkipLink() {
    return <Link href="#conteudo-principal">Pular para o conteúdo</Link>
}

const Link = styled.a`
    position: absolute;
    left: ${({ theme }) => theme.spacing(2)};
    top: -100px;
    z-index: ${({ theme }) => theme.zIndex.toast};
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.brand};
    color: ${({ theme }) => theme.colors.textInverse};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    text-decoration: none;
    transition: top ${({ theme }) => theme.transitions.fast};

    &:focus {
        top: ${({ theme }) => theme.spacing(2)};
    }
`
