import axios from 'axios'
import { resolveApiBaseUrl } from './api-url'
import { normalizeApiError } from './api-error'
import { readAuthToken, clearAuthToken } from '@/lib/auth/auth-cookie'

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler = () => { }

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
    onUnauthorized = handler
}

export const httpClient = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: 20000,
    headers: { Accept: 'application/json' },
})

httpClient.interceptors.request.use((config) => {
    const token = readAuthToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const apiError = normalizeApiError(error)

        if (apiError.status === 401) {
            clearAuthToken()
            onUnauthorized()
        }

        return Promise.reject(apiError)
    },
)
