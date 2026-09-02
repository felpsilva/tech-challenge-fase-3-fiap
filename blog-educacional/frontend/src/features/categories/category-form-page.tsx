'use client'

import { useCallback } from 'react'
import { CategoryForm } from './category-form'
import { RequireSession } from '@/features/auth/require-session'
import { Feedback } from '@/components/ui/feedback'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-container'
import { useAsyncResource } from '@/lib/hooks/use-async-resource'
import { fetchCategory } from '@/lib/api/category-service'
import type { Category } from '@/types/api'

interface CategoryFormPageProps {
    mode: 'create' | 'edit'
    categoryId?: number
}

export function CategoryFormPage({ mode, categoryId }: CategoryFormPageProps) {
    const loader = useCallback(
        () => (categoryId ? fetchCategory(categoryId) : Promise.resolve(null)),
        [categoryId],
    )

    const { data, error, isLoading } = useAsyncResource<Category | null>(loader)

    return (
        <RequireSession>
            <PageHeader>
                <div>
                    <PageTitle>
                        {mode === 'create' ? 'Nova categoria' : 'Editar categoria'}
                    </PageTitle>
                    <PageDescription>
                        {mode === 'create'
                            ? 'O slug é sugerido a partir do nome.'
                            : 'Os dados atuais da categoria já vêm carregados.'}
                    </PageDescription>
                </div>
            </PageHeader>

            {mode === 'edit' && isLoading && <p aria-live="polite">Carregando categoria…</p>}
            {error && <Feedback $tone="danger" role="alert">{error}</Feedback>}

            {mode === 'create' && <CategoryForm mode="create" />}
            {mode === 'edit' && data && <CategoryForm mode="edit" category={data} />}
        </RequireSession>
    )
}
