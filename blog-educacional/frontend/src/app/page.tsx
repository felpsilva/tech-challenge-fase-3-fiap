import { connection } from 'next/server'
import { serverGet } from '@/lib/api/server-fetch'
import { isPublished } from '@/types/post-status'
import { toPostCard } from '@/features/posts/to-post-card'
import { PostList } from '@/features/posts/post-list'
import {
    PageContainer,
    PageDescription,
    PageHeader,
    PageTitle,
} from '@/components/ui/page-container'
import { Feedback } from '@/components/ui/feedback'
import type { Post } from '@/types/api'

export default async function HomePage() {
    // Tira a home do prerender de build. Sem isto o Next marca `/` como estatica
    // e renderiza esta pagina durante o `docker build`, onde a API nao existe: o
    // aviso de erro virava HTML congelado na imagem e o primeiro visitante de
    // cada deploy recebia ele. O cache de dados do fetch abaixo continua valendo.
    await connection()

    const result = await serverGet<Post[]>('/post', { revalidate: 60, tags: ['posts'] })

    const posts = result.ok
        ? result.data.filter((post) => isPublished(post.status)).map(toPostCard)
        : []

    return (
        <PageContainer>
            <PageHeader>
                <div>
                    <PageTitle>Posts</PageTitle>
                    <PageDescription>
                        Materiais publicados por docentes.
                    </PageDescription>
                </div>
            </PageHeader>

            {!result.ok && (
                <Feedback $tone="warning">
                    {result.message} A listagem volta sozinha quando a API responder.
                </Feedback>
            )}

            {result.ok && <PostList posts={posts} />}
        </PageContainer>
    )
}
