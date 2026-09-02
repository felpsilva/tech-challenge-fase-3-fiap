import axios from 'axios'
import { resolveApiBaseUrl } from './api-url'
import { normalizeApiError } from './api-error'
import { readAuthToken, clearAuthToken } from '@/lib/auth/auth-cookie'

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler = () => { }

/**
 * O interceptor nao pode importar o contexto de auth (ciclo de import), e o
 * contexto nao pode recriar o cliente. O handler e injetado pelo provider.
 */
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

// Sem `Content-Type` fixo na instancia: definir 'application/json' aqui
// quebraria o upload, porque o axios precisa montar o boundary do multipart.
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
