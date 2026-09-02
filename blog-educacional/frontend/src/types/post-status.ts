import type { PostStatus } from './api'

export const POST_STATUSES: readonly PostStatus[] = ['draft', 'published']

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
}

export function isPublished(status: string) {
    return status === 'published'
}

/**
 * Valor desconhecido cai em `draft` de proposito: uma linha antiga com
 * `status: 'ativo'` aparece como rascunho no admin e fica escondida no
 * publico. Em visibilidade, o default seguro e o mais restritivo.
 */
export function normalizeStatus(status: string): PostStatus {
    return status === 'published' ? 'published' : 'draft'
}
