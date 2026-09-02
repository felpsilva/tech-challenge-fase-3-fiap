import { httpClient } from './http-client'
import type { Category } from '@/types/api'

export interface CategoryPayload {
    name: string
    slug: string
}

export async function fetchCategories() {
    const response = await httpClient.get<Category[]>('/category')

    return response.data
}

export async function fetchCategory(id: number) {
    const response = await httpClient.get<Category>(`/category/${id}`)

    return response.data
}

export async function createCategory(payload: CategoryPayload) {
    const response = await httpClient.post<Category>('/category', payload)

    return response.data
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>) {
    const response = await httpClient.put<Category>(`/category/${id}`, payload)

    return response.data
}

export async function deleteCategory(id: number) {
    await httpClient.delete(`/category/${id}`)
}
