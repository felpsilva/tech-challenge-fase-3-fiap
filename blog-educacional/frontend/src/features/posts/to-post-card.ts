import { toExcerpt } from '@/lib/utils/excerpt'
import { deaccent } from '@/lib/utils/slugify'
import type { Post } from '@/types/api'
import type { PostCardData } from '@/types/view'

/**
 * Roda no Server Component. Dois ganhos: o payload que vai ao navegador leva
 * ~280 caracteres por post em vez do artigo inteiro, e o texto de busca já
 * chega normalizado — o cliente não renormaliza a cada tecla digitada.
 */
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
