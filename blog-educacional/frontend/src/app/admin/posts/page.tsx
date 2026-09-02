'use client'

import Link from 'next/link'
import { PostTable } from '@/features/posts/post-table'
import { RequireSession } from '@/features/auth/require-session'
import { LinkButton } from '@/components/ui/button'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-container'

export default function AdminPostsPage() {
    return (
        <RequireSession>
            <PageHeader>
                <div>
                    <PageTitle>Posts</PageTitle>
                    <PageDescription>Editar e excluir publicações.</PageDescription>
                </div>
                <LinkButton as={Link} href="/admin/posts/new">Novo post</LinkButton>
            </PageHeader>

            <PostTable />
        </RequireSession>
    )
}
