import { toExcerpt } from '@/lib/utils/excerpt'
import { deaccent } from '@/lib/utils/slugify'
import type { Post } from '@/types/api'
import type { PostCardData } from '@/types/view'

export function toPostCard(post: Post): PostCardData {
    const authorName = post.user?.username ?? 'Autor não identificado'
    const haystack = `${post.title} ${authorName} ${post.content}`

    return {
        id: post.id,
        title: post.title,
        authorName,
        excerpt: toExcerpt(post.content),
        createdAt: post.created_at,
        imageUrl: post.image_url,
        thumbnailVersion: post.updated_at,
        categories: (post.categories ?? []).map((category) => ({
            id: category.id,
            name: category.name,
        })),
        searchText: deaccent(haystack).toLowerCase(),
    }
}
