export type Permission = 'admin' | 'professor' | 'aluno'
export type PostStatus = 'draft' | 'published'

export interface Category {
    id: number
    name: string
    slug: string
    created_at: string
}

export interface UserView {
    id: number
    username: string
    permission: Permission
    created_at: string
}

export interface Post {
    id: number
    user_id: number
    title: string
    slug: string
    content: string
    image_url: string | null
    status: string
    created_at: string
    updated_at: string
    user?: UserView
    categories?: Category[]
}

export interface ThumbnailMetadata {
    post_id: number
    filename: string
    mime_type: string
    size_bytes: number
    created_at: string
    updated_at: string
}
