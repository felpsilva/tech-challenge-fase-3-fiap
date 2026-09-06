'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { canAccessPanel, canManageUsers } from '@/types/permissions'
import { Feedback } from '@/components/ui/feedback'

interface RequireSessionProps {
    children: ReactNode
    adminOnly?: boolean
}

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
