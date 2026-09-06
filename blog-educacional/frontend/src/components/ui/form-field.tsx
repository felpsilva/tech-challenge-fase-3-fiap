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

const ErrorText = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    color: ${({ theme }) => theme.colors.danger};
`
