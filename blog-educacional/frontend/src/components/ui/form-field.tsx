'use client'

import type { ReactNode } from 'react'
import styled from 'styled-components'

interface FieldRenderProps {
    id: string
    'aria-invalid': true | undefined
    'aria-describedby': string | undefined
    'aria-required': true | undefined
}

interface FormFieldProps {
    name: string
    label: string
    hint?: string
    error?: string | undefined
    required?: boolean
    children: (props: FieldRenderProps) => ReactNode
}

/**
 * Primitivo por onde passa todo campo do app. A ligacao de rotulo, dica e
 * erro fica aqui para nao depender de ninguem lembrar em cada formulario.
 *
 * Dois detalhes: o `aria-describedby` é condicional porque apontar para um id
 * inexistente é descartado em silêncio por parte dos leitores de tela; e o
 * `aria-invalid` só vai como `true` — mandar `false` faz alguns leitores
 * anunciarem "válido" a cada campo, o que é ruído.
 */
export function FormField({ name, label, hint, error, required, children }: FormFieldProps) {
    const id = `field-${name}`
    const hintId = hint ? `${id}-hint` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    return (
        <Wrapper>
            <Label htmlFor={id}>
                {label}
                {required && <Required aria-hidden="true"> *</Required>}
                {required && <ScreenReaderOnly> (obrigatório)</ScreenReaderOnly>}
            </Label>

            {hint && <Hint id={hintId}>{hint}</Hint>}

            {children({
                id,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': describedBy,
                'aria-required': required ? true : undefined,
            })}

            {error && (
                <ErrorText id={errorId} role="alert">
                    <span aria-hidden="true">⚠ </span>
                    {error}
                </ErrorText>
            )}
        </Wrapper>
    )
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
`

const Label = styled.label`
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.text};
`

const Required = styled.span`
    color: ${({ theme }) => theme.colors.danger};
`

const ScreenReaderOnly = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
`

const Hint = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`

// Marcador de texto junto do icone: cor sozinha nao comunica erro (WCAG 1.4.1).
const ErrorText = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    color: ${({ theme }) => theme.colors.danger};
`
