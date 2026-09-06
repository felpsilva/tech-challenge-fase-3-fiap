'use client'

import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Button } from './button'
import { Feedback } from './feedback'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    isConfirming?: boolean
    error?: string | null
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Excluir',
    isConfirming = false,
    error = null,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current

        if (!dialog) {
            return
        }

        if (open && !dialog.open) {
            dialog.showModal()
            cancelRef.current?.focus()
        }

        if (!open && dialog.open) {
            dialog.close()
        }
    }, [open])

    return (
        <Dialog
            ref={dialogRef}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            onCancel={(event) => {
                event.preventDefault()
                onCancel()
            }}
        >
            <Title id="confirm-dialog-title">{title}</Title>
            <Description id="confirm-dialog-description">{description}</Description>

            {error && <Feedback $tone="danger">{error}</Feedback>}

            <Actions>
                <Button ref={cancelRef} type="button" $variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="button" $variant="danger" onClick={onConfirm} disabled={isConfirming}>
                    {isConfirming ? 'Excluindo…' : confirmLabel}
                </Button>
            </Actions>
        </Dialog>
    )
}

const Dialog = styled.dialog`
    width: min(440px, calc(100vw - 32px));
    padding: ${({ theme }) => theme.spacing(6)};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: ${({ theme }) => theme.shadows.lg};

    &::backdrop {
        background: rgba(20, 24, 31, 0.5);
    }
`

const Title = styled.h2`
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.sizes.xl};
`

const Description = styled.p`
    margin-bottom: ${({ theme }) => theme.spacing(4)};
    color: ${({ theme }) => theme.colors.textMuted};
`

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(4)};
`
