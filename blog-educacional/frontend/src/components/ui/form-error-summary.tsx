'use client'

import { useEffect, useRef } from 'react'
import styled from 'styled-components'

interface FormErrorSummaryProps {
    message: string | null
    fieldErrors?: Record<string, string>
}

/**
 * Resumo de erro no topo do formulario. É o recurso de acessibilidade de
 * maior retorno num app cheio de formulário: recebe foco no envio falho, e
 * quem usa teclado ou leitor de tela ouve o que deu errado em vez de caçar
 * campo vermelho pela tela.
 */
export function FormErrorSummary({ message, fieldErrors }: FormErrorSummaryProps) {
    const ref = useRef<HTMLDivElement>(null)
    const entries = Object.entries(fieldErrors ?? {})

    useEffect(() => {
        if (message) {
            ref.current?.focus()
        }
    }, [message])

    if (!message) {
        return null
    }

    return (
        <Wrapper ref={ref} role="alert" tabIndex={-1}>
            <Title>{message}</Title>

            {entries.length > 0 && (
                <List>
                    {entries.map(([field, fieldMessage]) => (
                        <li key={field}>
                            <a href={`#field-${field}`}>{fieldMessage}</a>
                        </li>
                    ))}
                </List>
            )}
        </Wrapper>
    )
}

const Wrapper = styled.div`
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
    border: 1px solid ${({ theme }) => theme.colors.danger};
    border-left-width: 4px;
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.dangerSubtle};
    color: ${({ theme }) => theme.colors.danger};
`

const Title = styled.p`
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
`

const List = styled.ul`
    margin-top: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
`
