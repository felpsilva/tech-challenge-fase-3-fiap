import { resolveApiBaseUrl } from './api-url'

export type ServerResult<T> =
    | { ok: true; data: T }
    | { ok: false; status: number; message: string }

interface ServerGetOptions {
    revalidate?: number | false
    tags?: string[]
}

/**
 * Busca para Server Components. Nunca lanca — devolve um resultado.
 *
 * O motivo e concreto: o `next build` pre-renderiza a home, ou seja, faz esta
 * chamada em tempo de BUILD. Dentro do `docker build` a API nao esta no ar, e
 * uma excecao aqui derrubaria a imagem inteira. Devolvendo `ok: false`, a
 * pagina mostra um estado vazio honesto e se recupera sozinha na primeira
 * revalidacao. A alternativa (`dynamic = 'force-dynamic'`) evitaria a chamada
 * no build, mas jogaria fora o cache da pagina mais acessada.
 */
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
