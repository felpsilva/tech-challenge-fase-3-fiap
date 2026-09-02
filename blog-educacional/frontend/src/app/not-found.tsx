import Link from 'next/link'

export default function NotFound() {
    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 16px' }}>
            <h1>Página não encontrada</h1>
            <p>O endereço acessado não existe ou o conteúdo foi removido.</p>
            <Link href="/">Voltar para a lista de posts</Link>
        </div>
    )
}
