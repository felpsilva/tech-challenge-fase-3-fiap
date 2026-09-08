import { resolveApiBaseUrl } from './api-url'

export type ServerResult<T> =
    | { ok: true; data: T }
    | { ok: false; status: number; message: string }

// Nunca lanca: quando a API falha, o visitante ve um aviso em vez de tela de erro.
// O `cache: 'no-store'` garante que uma nova requisicao veja as alteracoes mais
// recentes da API.
export async function serverGet<T>(
    path: string,
): Promise<ServerResult<T>> {
    try {
        const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                message: response.status === 404
                    ? 'Registro não encontrado.'
                    : 'Não foi possível carregar os dados.',
            }
        }

        return { ok: true, data: (await response.json()) as T }
    } catch {
        return {
            ok: false,
            status: 0,
            message: 'Não foi possível contatar a API.',
        }
    }
}
