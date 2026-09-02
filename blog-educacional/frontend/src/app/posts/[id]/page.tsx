import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverGet } from '@/lib/api/server-fetch'
import { isPublished } from '@/types/post-status'
import { toExcerpt } from '@/lib/utils/excerpt'
import { PostArticle } from '@/features/posts/post-article'
import type { Post } from '@/types/api'

interface PostPageProps {
    // No Next 16 `params` é Promise: o acesso síncrono foi removido.
    params: Promise<{ id: string }>
}

async function loadPublishedPost(rawId: string) {
    const id = Number(rawId)

    if (!Number.isInteger(id) || id <= 0) {
        return null
    }

    const result = await serverGet<Post>(`/post/${id}`, {
        revalidate: 60,
        tags: ['posts', `post-${id}`],
    })

    if (!result.ok || !isPublished(result.data.status)) {
        return null
    }

    return result.data
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { id } = await params
    const post = await loadPublishedPost(id)

    if (!post) {
        return { title: 'Post não encontrado' }
    }

    return {
        title: post.title,
        description: toExcerpt(post.content, 160),
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const { id } = await params
    const post = await loadPublishedPost(id)

    if (!post) {
        notFound()
    }

    return <PostArticle post={post} />
}
