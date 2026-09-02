import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Sem permissão' }

export default function ForbiddenPage() {
    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 16px' }}>
            <h1>Sem permissão</h1>
            <p>Sua conta não tem acesso a esta área.</p>
            <Link href="/">Voltar para a lista de posts</Link>
        </div>
    )
}
