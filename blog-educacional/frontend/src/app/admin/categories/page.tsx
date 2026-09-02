'use client'

import Link from 'next/link'
import { CategoryTable } from '@/features/categories/category-table'
import { RequireSession } from '@/features/auth/require-session'
import { LinkButton } from '@/components/ui/button'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-container'

export default function AdminCategoriesPage() {
    return (
        <RequireSession>
            <PageHeader>
                <div>
                    <PageTitle>Categorias</PageTitle>
                    <PageDescription>Editar e excluir categorias.</PageDescription>
                </div>
                <LinkButton as={Link} href="/admin/categories/new">Nova categoria</LinkButton>
            </PageHeader>

            <CategoryTable />
        </RequireSession>
    )
}
