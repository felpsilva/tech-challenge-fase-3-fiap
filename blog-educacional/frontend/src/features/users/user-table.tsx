'use client'

import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Table, TableWrapper, RowActions } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/inputs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Feedback, EmptyState } from '@/components/ui/feedback'
import { useAsyncResource } from '@/lib/hooks/use-async-resource'
import { useAuth } from '@/lib/auth/auth-context'
import { isApiError } from '@/lib/api/api-error'
import { fetchUsers, updateUser, deleteUser } from '@/lib/api/user-service'
import { formatDate } from '@/lib/utils/format-date'
import { PERMISSIONS, PERMISSION_LABELS, normalizePermission } from '@/types/permissions'
import type { Permission, UserView } from '@/types/api'

export function UserTable() {
    const { user: currentUser } = useAuth()
    const { data, error, isLoading, reload } = useAsyncResource<UserView[]>(fetchUsers)
    const [drafts, setDrafts] = useState<Record<number, Permission>>({})
    const [savingId, setSavingId] = useState<number | null>(null)
    const [rowError, setRowError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [target, setTarget] = useState<UserView | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const savePermission = useCallback(
        async (item: UserView) => {
            const permission = drafts[item.id]

            if (!permission || permission === item.permission) {
                return
            }

            setSavingId(item.id)
            setRowError(null)

            try {
                await updateUser(item.id, { permission })
                setStatus(`Permissão de ${item.username} atualizada para ${PERMISSION_LABELS[permission]}.`)
                setDrafts((current) => {
                    const next = { ...current }
                    delete next[item.id]
                    return next
                })
                reload()
            } catch (caught) {
                setRowError(
                    isApiError(caught) ? caught.message : 'Não foi possível salvar a permissão.',
                )
            } finally {
                setSavingId(null)
            }
        },
        [drafts, reload],
    )

    const confirmDelete = useCallback(async () => {
        if (!target) {
            return
        }

        setIsDeleting(true)
        setDeleteError(null)

        try {
            await deleteUser(target.id)
            setStatus(`Usuário ${target.username} excluído.`)
            setTarget(null)
            reload()
        } catch (caught) {
            setDeleteError(isApiError(caught) ? caught.message : 'Não foi possível excluir.')
        } finally {
            setIsDeleting(false)
        }
    }, [target, reload])

    if (isLoading) {
        return <p aria-live="polite">Carregando usuários…</p>
    }

    if (error) {
        return <Feedback $tone="danger" role="alert">{error}</Feedback>
    }

    const users = data ?? []

    return (
        <>
            <StatusRegion aria-live="polite">{status}</StatusRegion>
            {rowError && <Feedback $tone="danger" role="alert">{rowError}</Feedback>}

            {users.length === 0 ? (
                <EmptyState><p>Nenhum usuário cadastrado.</p></EmptyState>
            ) : (
                <TableWrapper>
                    <Table>
                        <caption>Usuários cadastrados</caption>
                        <thead>
                            <tr>
                                <th scope="col">Usuário</th>
                                <th scope="col">Permissão</th>
                                <th scope="col">Criado em</th>
                                <th scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((item) => {
                                const isSelf = item.id === currentUser?.id
                                const draft = drafts[item.id] ?? normalizePermission(item.permission)
                                const isDirty = draft !== item.permission

                                return (
                                    <tr key={item.id}>
                                        <td data-label="Usuário">{item.username}</td>
                                        <td data-label="Permissão">
                                            <PermissionCell>
                                                <label htmlFor={`permission-${item.id}`}>
                                                    <VisuallyHiddenLabel>
                                                        Permissão de {item.username}
                                                    </VisuallyHiddenLabel>
                                                </label>
                                                <Select
                                                    id={`permission-${item.id}`}
                                                    value={draft}
                                                    disabled={isSelf || savingId === item.id}
                                                    onChange={(event) =>
                                                        setDrafts((current) => ({
                                                            ...current,
                                                            [item.id]: event.target.value as Permission,
                                                        }))
                                                    }
                                                >
                                                    {PERMISSIONS.map((permission) => (
                                                        <option key={permission} value={permission}>
                                                            {PERMISSION_LABELS[permission]}
                                                        </option>
                                                    ))}
                                                </Select>

                                                <Button
                                                    type="button"
                                                    $variant="secondary"
                                                    disabled={isSelf || !isDirty || savingId === item.id}
                                                    aria-label={`Salvar permissão de ${item.username}`}
                                                    onClick={() => savePermission(item)}
                                                >
                                                    {savingId === item.id ? 'Salvando…' : 'Salvar'}
                                                </Button>
                                            </PermissionCell>

                                            {isSelf && (
                                                <SelfNote>
                                                    Você não pode alterar a própria permissão.
                                                </SelfNote>
                                            )}
                                        </td>
                                        <td data-label="Criado em">
                                            {item.created_at ? formatDate(item.created_at) : '—'}
                                        </td>
                                        <td data-label="Ações">
                                            <RowActions>
                                                <Button
                                                    type="button"
                                                    $variant="danger"
                                                    disabled={isSelf}
                                                    aria-label={`Excluir usuário: ${item.username}`}
                                                    onClick={() => {
                                                        setDeleteError(null)
                                                        setTarget(item)
                                                    }}
                                                >
                                                    Excluir
                                                </Button>
                                            </RowActions>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </TableWrapper>
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title="Excluir usuário"
                description={
                    target
                        ? `Excluir o usuário "${target.username}"? Os posts dele continuam no banco.`
                        : ''
                }
                isConfirming={isDeleting}
                error={deleteError}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setTarget(null)
                    setDeleteError(null)
                }}
            />
        </>
    )
}

const StatusRegion = styled.p`
    min-height: 1.5em;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.success};
`

const PermissionCell = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};

    select {
        width: auto;
        min-width: 160px;
    }
`

const VisuallyHiddenLabel = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
`

const SelfNote = styled.p`
    margin-top: ${({ theme }) => theme.spacing(1)};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`
