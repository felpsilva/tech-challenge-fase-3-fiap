'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { canAccessPanel, canManageUsers } from '@/types/permissions'
import { Feedback } from '@/components/ui/feedback'

interface RequireSessionProps {
    children: ReactNode
    /** `true` restringe a tela a admin (gestão de usuários). */
    adminOnly?: boolean
}

/**
 * Segunda barreira, depois do `proxy.ts`. Existe porque a guarda do proxy lê
 * claims sem verificar assinatura — alguém pode forjar o cookie e chegar até
 * aqui. Nem isto é autorização de verdade: quem decide é o backend, que
 * responde 401/403 para o token forjado. Isto evita que a tela apareça
 * quebrada em vez de dizer o que aconteceu.
 */
export function RequireSession({ children, adminOnly = false }: RequireSessionProps) {
    const { user, isReady } = useAuth()

    if (!isReady) {
        return <p aria-live="polite">Verificando sessão…</p>
    }

    if (!user || !canAccessPanel(user.permission)) {
        return (
            <Feedback $tone="danger" role="alert">
                Sua conta não tem acesso ao painel.
            </Feedback>
        )
    }

    if (adminOnly && !canManageUsers(user.permission)) {
        return (
            <Feedback $tone="danger" role="alert">
                Apenas administradores gerenciam usuários.
            </Feedback>
        )
    }

    return <>{children}</>
}
