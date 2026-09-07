import { resolveApiBaseUrl } from './api-url'

export type ServerResult<T> =
    | { ok: true; data: T }
    | { ok: false; status: number; message: string }

interface ServerGetOptions {
    revalidate?: number | false
    tags?: string[]
}

// Nunca lanca: quando a API falha, o visitante ve um aviso em vez de tela de erro
// e a proxima revalidacao se recupera sozinha. Quem impede o `ok: false` de virar
// HTML congelado na imagem e o connection() em app/page.tsx, que tira a home do
// prerender de build.
export async function serverGet<T>(
    path: string,
    options: ServerGetOptions = {},
): Promise<ServerResult<T>> {
    const { revalidate = 60, tags } = options

    try {
        const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
            headers: { Accept: 'application/json' },
            next: {
                ...(revalidate === false ? {} : { revalidate }),
                ...(tags ? { tags } : {}),
            },
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
