export interface PostCardData {
    id: number
    title: string
    authorName: string
    excerpt: string
    createdAt: string
    imageUrl: string | null
    thumbnailVersion: string
    categories: Array<{ id: number; name: string }>
    searchText: string
}
