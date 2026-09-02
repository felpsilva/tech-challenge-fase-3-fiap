'use client'

import { UserTable } from '@/features/users/user-table'
import { RequireSession } from '@/features/auth/require-session'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-container'

export default function AdminUsersPage() {
    return (
        // `adminOnly`: a rota /user do backend é restrita a admin.
        <RequireSession adminOnly>
            <PageHeader>
                <div>
                    <PageTitle>Usuários</PageTitle>
                    <PageDescription>
                        Gerenciar permissões e excluir contas.
                    </PageDescription>
                </div>
            </PageHeader>

            <UserTable />
        </RequireSession>
    )
}
