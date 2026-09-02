'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Table, TableWrapper, RowActions } from '@/components/ui/data-table'
import { Button, LinkButton } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Feedback, EmptyState } from '@/components/ui/feedback'
import { useAsyncResource } from '@/lib/hooks/use-async-resource'
import { isApiError } from '@/lib/api/api-error'
import { fetchCategories, deleteCategory } from '@/lib/api/category-service'
import { formatDate } from '@/lib/utils/format-date'
import type { Category } from '@/types/api'

export function CategoryTable() {
    const { data, error, isLoading, reload } = useAsyncResource<Category[]>(fetchCategories)
    const [target, setTarget] = useState<Category | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)

    const confirmDelete = useCallback(async () => {
        if (!target) {
            return
        }

        setIsDeleting(true)
        setDeleteError(null)

        try {
            await deleteCategory(target.id)
            setStatus(`Categoria "${target.name}" excluída.`)
            setTarget(null)
            reload()
        } catch (caught) {
            setDeleteError(isApiError(caught) ? caught.message : 'Não foi possível excluir.')
        } finally {
            setIsDeleting(false)
        }
    }, [target, reload])

    if (isLoading) {
        return <p aria-live="polite">Carregando categorias…</p>
    }

    if (error) {
        return <Feedback $tone="danger" role="alert">{error}</Feedback>
    }

    const categories = data ?? []

    return (
        <>
            <StatusRegion aria-live="polite">{status}</StatusRegion>

            {categories.length === 0 ? (
                <EmptyState>
                    <p>Nenhuma categoria cadastrada.</p>
                    <LinkButton as={Link} href="/admin/categories/new">
                        Criar a primeira categoria
                    </LinkButton>
                </EmptyState>
            ) : (
                <TableWrapper>
                    <Table>
                        <caption>Categorias cadastradas</caption>
                        <thead>
                            <tr>
                                <th scope="col">Nome</th>
                                <th scope="col">Slug</th>
                                <th scope="col">Criada em</th>
                                <th scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td data-label="Nome">{category.name}</td>
                                    <td data-label="Slug"><code>{category.slug}</code></td>
                                    <td data-label="Criada em">{formatDate(category.created_at)}</td>
                                    <td data-label="Ações">
                                        <RowActions>
                                            <LinkButton
                                                as={Link}
                                                href={`/admin/categories/${category.id}/edit`}
                                                $variant="secondary"
                                                aria-label={`Editar categoria: ${category.name}`}
                                            >
                                                Editar
                                            </LinkButton>
                                            <Button
                                                type="button"
                                                $variant="danger"
                                                aria-label={`Excluir categoria: ${category.name}`}
                                                onClick={() => {
                                                    setDeleteError(null)
                                                    setTarget(category)
                                                }}
                                            >
                                                Excluir
                                            </Button>
                                        </RowActions>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableWrapper>
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title="Excluir categoria"
                description={
                    target
                        ? `Excluir a categoria "${target.name}"? Os posts que a usam perdem esse vínculo.`
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
