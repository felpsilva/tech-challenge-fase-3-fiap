export interface PostCardData {
    id: number
    title: string
    authorName: string
    excerpt: string
    createdAt: string
    imageUrl: string | null
    thumbnailVersion: string
    categories: Array<{ id: number; name: string }>
    /** Texto já normalizado para a busca no cliente (sem acento, minúsculo). */
    searchText: string
}
