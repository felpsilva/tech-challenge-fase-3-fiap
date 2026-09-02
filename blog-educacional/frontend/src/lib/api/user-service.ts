import { httpClient } from './http-client'
import type { Permission, UserView } from '@/types/api'

export interface CreateUserPayload {
    username: string
    password: string
    permission: Permission
}

export interface UpdateUserPayload {
    username?: string
    password?: string
    permission?: Permission
}

export async function fetchUsers() {
    const response = await httpClient.get<UserView[]>('/user')

    return response.data
}

export async function createUser(payload: CreateUserPayload) {
    // A resposta do POST nao traz `created_at` — o controller projeta so
    // esses tres campos.
    const response = await httpClient.post<Pick<UserView, 'id' | 'username' | 'permission'>>(
        '/user',
        payload,
    )

    return response.data
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
    const response = await httpClient.put<UserView>(`/user/${id}`, payload)

    return response.data
}

export async function deleteUser(id: number) {
    await httpClient.delete(`/user/${id}`)
}
