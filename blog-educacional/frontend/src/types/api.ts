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
    /**
     * String crua de proposito: a coluna e varchar sem enum e o Zod aceita
     * qualquer valor. Tipar como uniao aqui seria uma mentira que produz bug
     * silencioso — use `normalizeStatus` para estreitar.
     */
    status: string
    created_at: string
    updated_at: string
    /** Ausente nas respostas de POST e PUT, que nao carregam as relacoes. */
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
