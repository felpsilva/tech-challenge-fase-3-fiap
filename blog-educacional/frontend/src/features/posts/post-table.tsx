'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Table, TableWrapper, RowActions } from '@/components/ui/data-table'
import { Button, LinkButton } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Feedback, EmptyState } from '@/components/ui/feedback'
import { useAsyncResource } from '@/lib/hooks/use-async-resource'
import { isApiError } from '@/lib/api/api-error'
import { fetchPosts, deletePost } from '@/lib/api/post-service'
import { formatDate } from '@/lib/utils/format-date'
import { POST_STATUS_LABELS, normalizeStatus } from '@/types/post-status'
import type { Post } from '@/types/api'

export function PostTable() {
    const { data, error, isLoading, reload } = useAsyncResource<Post[]>(fetchPosts)
    const [target, setTarget] = useState<Post | null>(null)
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
            await deletePost(target.id)
            setStatus(`Post "${target.title}" excluído.`)
            setTarget(null)
            reload()
        } catch (caught) {
            setDeleteError(isApiError(caught) ? caught.message : 'Não foi possível excluir.')
        } finally {
            setIsDeleting(false)
        }
    }, [target, reload])

    if (isLoading) {
        return <p aria-live="polite">Carregando posts…</p>
    }

    if (error) {
        return <Feedback $tone="danger" role="alert">{error}</Feedback>
    }

    const posts = data ?? []

    return (
        <>
            <StatusRegion aria-live="polite">{status}</StatusRegion>

            {posts.length === 0 ? (
                <EmptyState>
                    <p>Nenhum post cadastrado.</p>
                    <LinkButton as={Link} href="/admin/posts/new">Criar o primeiro post</LinkButton>
                </EmptyState>
            ) : (
                <TableWrapper>
                    <Table aria-busy={isLoading}>
                        <caption>Posts cadastrados</caption>
                        <thead>
                            <tr>
                                <th scope="col">Título</th>
                                <th scope="col">Autor</th>
                                <th scope="col">Status</th>
                                <th scope="col">Criado em</th>
                                <th scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => {
                                const postStatus = normalizeStatus(post.status)

                                return (
                                    <tr key={post.id}>
                                        <td data-label="Título">{post.title}</td>
                                        <td data-label="Autor">{post.user?.username ?? '—'}</td>
                                        <td data-label="Status">
                                            <Badge $tone={postStatus === 'published' ? 'success' : 'warning'}>
                                                {POST_STATUS_LABELS[postStatus]}
                                            </Badge>
                                        </td>
                                        <td data-label="Criado em">{formatDate(post.created_at)}</td>
                                        <td data-label="Ações">
                                            <RowActions>
                                                <LinkButton
                                                    as={Link}
                                                    href={`/admin/posts/${post.id}/edit`}
                                                    $variant="secondary"
                                                    aria-label={`Editar post: ${post.title}`}
                                                >
                                                    Editar
                                                </LinkButton>
                                                <Button
                                                    type="button"
                                                    $variant="danger"
                                                    aria-label={`Excluir post: ${post.title}`}
                                                    onClick={() => {
                                                        setDeleteError(null)
                                                        setTarget(post)
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
                title="Excluir post"
                description={
                    target
                        ? `Excluir o post "${target.title}"? Esta ação não pode ser desfeita.`
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
