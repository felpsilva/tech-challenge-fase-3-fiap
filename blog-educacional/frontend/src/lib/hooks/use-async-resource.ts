'use client'

import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '@/lib/api/api-error'

interface AsyncResource<T> {
    data: T | null
    error: string | null
    isLoading: boolean
    reload: () => void
}

/**
 * Carregamento das listagens administrativas. Elas são Client Components
 * porque as ações (excluir, trocar permissão) vivem ali, e o token está no
 * cookie legível pelo axios.
 */
export function useAsyncResource<T>(loader: () => Promise<T>): AsyncResource<T> {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadToken, setReloadToken] = useState(0)

    const reload = useCallback(() => setReloadToken((value) => value + 1), [])

    useEffect(() => {
        let active = true

        // Buscar dado e o caso legitimo de efeito (sincronizar com sistema
        // externo). Os setState ficam dentro da funcao async para nao rodarem
        // sincronamente no corpo do efeito e disparar render em cascata.
        const load = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const result = await loader()

                if (active) {
                    setData(result)
                }
            } catch (caught: unknown) {
                if (active) {
                    setError(isApiError(caught) ? caught.message : 'Erro ao carregar os dados.')
                }
            } finally {
                if (active) {
                    setIsLoading(false)
                }
            }
        }

        void load()

        return () => {
            active = false
        }
        // `loader` é recriado a cada render nos chamadores; o token é o gatilho.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadToken])

    return { data, error, isLoading, reload }
}
