import { httpClient } from './http-client'

export interface SignInPayload {
    username: string
    password: string
}

export async function signIn(payload: SignInPayload) {
    const response = await httpClient.post<{ token: string }>('/user/signin', payload)

    return response.data
}
