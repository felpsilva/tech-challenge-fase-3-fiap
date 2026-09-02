import { httpClient } from './http-client'
import { resolvePublicApiBaseUrl } from './api-url'
import type { Post, PostStatus, ThumbnailMetadata } from '@/types/api'

export interface CreatePostPayload {
    user_id: number
    title: string
    slug: string
    content: string
    status: PostStatus
    image_url?: string
    categories?: Array<{ id: number }>
}

export type UpdatePostPayload = Partial<Omit<CreatePostPayload, 'user_id'>>

export async function fetchPosts() {
    const response = await httpClient.get<Post[]>('/post')

    return response.data
}

export async function fetchPost(id: number) {
    const response = await httpClient.get<Post>(`/post/${id}`)

    return response.data
}

export async function searchPosts(q: string) {
    const response = await httpClient.get<Post[]>('/post/search', { params: { q } })

    return response.data
}

export async function createPost(payload: CreatePostPayload) {
    const response = await httpClient.post<Post>('/post', payload)

    return response.data
}

export async function updatePost(id: number, payload: UpdatePostPayload) {
    const response = await httpClient.put<Post>(`/post/${id}`, payload)

    return response.data
}

export async function deletePost(id: number) {
    await httpClient.delete(`/post/${id}`)
}

export async function uploadPostThumbnail(id: number, file: File) {
    const form = new FormData()
    // O nome do campo e `file`: e o que o README e o teste do backend usam.
    form.append('file', file)

    const response = await httpClient.post<ThumbnailMetadata>(`/post/${id}/thumbnail`, form)

    return response.data
}

export async function deletePostThumbnail(id: number) {
    await httpClient.delete(`/post/${id}/thumbnail`)
}

/**
 * A imagem nao tem URL no JSON: a rota do backend *e* a URL. Sempre a base
 * publica, porque o valor vai para um `<img src>` resolvido pelo navegador,
 * mesmo quando a tag foi renderizada no servidor.
 *
 * O `version` existe porque um novo upload troca os bytes na mesma URL — sem
 * isso o navegador serve a imagem antiga do cache.
 */
export function buildThumbnailUrl(id: number, version?: string | number) {
    const base = `${resolvePublicApiBaseUrl()}/post/${id}/thumbnail`

    return version ? `${base}?v=${encodeURIComponent(String(version))}` : base
}
