'use client'

import { useCallback } from 'react'
import { PostForm } from './post-form'
import { RequireSession } from '@/features/auth/require-session'
import { Feedback } from '@/components/ui/feedback'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-container'
import { useAsyncResource } from '@/lib/hooks/use-async-resource'
import { useAuth } from '@/lib/auth/auth-context'
import { canManageUsers } from '@/types/permissions'
import { fetchCategories } from '@/lib/api/category-service'
import { fetchUsers } from '@/lib/api/user-service'
import { fetchPost } from '@/lib/api/post-service'
import type { Category, Post, UserView } from '@/types/api'

interface PostFormPageProps {
    mode: 'create' | 'edit'
    postId?: number
}

interface FormData {
    categories: Category[]
    users: UserView[]
    post: Post | null
}

export function PostFormPage({ mode, postId }: PostFormPageProps) {
    const { user } = useAuth()
    const isAdmin = canManageUsers(user?.permission ?? '')

    const loader = useCallback(async (): Promise<FormData> => {
        const [categories, users, post] = await Promise.all([
            fetchCategories(),
            isAdmin ? fetchUsers() : Promise.resolve<UserView[]>([]),
            postId ? fetchPost(postId) : Promise.resolve(null),
        ])

        return { categories, users, post }
    }, [isAdmin, postId])

    const { data, error, isLoading } = useAsyncResource<FormData>(loader)

    return (
        <RequireSession>
            <PageHeader>
                <div>
                    <PageTitle>{mode === 'create' ? 'Novo post' : 'Editar post'}</PageTitle>
                    <PageDescription>
                        {mode === 'create'
                            ? 'Preencha os dados da publicação.'
                            : 'Os dados atuais do post já vêm carregados.'}
                    </PageDescription>
                </div>
            </PageHeader>

            {isLoading && <p aria-live="polite">Carregando formulário…</p>}
            {error && <Feedback $tone="danger" role="alert">{error}</Feedback>}

            {data && (
                <PostForm
                    mode={mode}
                    categories={data.categories}
                    users={data.users}
                    {...(data.post ? { post: data.post } : {})}
                />
            )}
        </RequireSession>
    )
}
