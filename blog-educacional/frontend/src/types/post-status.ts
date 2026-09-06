import type { PostStatus } from './api'

export const POST_STATUSES: readonly PostStatus[] = ['draft', 'published']

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
}

export function isPublished(status: string) {
    return status === 'published'
}

export function normalizeStatus(status: string): PostStatus {
    return status === 'published' ? 'published' : 'draft'
}
