import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminNav } from '@/components/layout/admin-nav'
import { PageContainer } from '@/components/ui/page-container'

export const metadata: Metadata = { title: { default: 'Painel', template: '%s · Painel' } }

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <PageContainer>
            <AdminNav />
            <Content>{children}</Content>
        </PageContainer>
    )
}

function Content({ children }: { children: ReactNode }) {
    return <div style={{ paddingTop: 32 }}>{children}</div>
}
