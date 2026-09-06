import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/login-form'
import {
    PageContainer,
    PageDescription,
    PageHeader,
    PageTitle,
} from '@/components/ui/page-container'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage() {
    return (
        <PageContainer>
            <PageHeader>
                <div>
                    <PageTitle>Entrar</PageTitle>
                    <PageDescription>Acesso ao painel de publicação.</PageDescription>
                </div>
            </PageHeader>

            <Suspense fallback={<p>Carregando…</p>}>
                <LoginForm />
            </Suspense>
        </PageContainer>
    )
}
