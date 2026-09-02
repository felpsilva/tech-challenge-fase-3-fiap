'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { slugify } from '@/lib/utils/slugify'

interface UseSlugSyncOptions {
    source: string
    setSlug: (value: string) => void
    /** `true` na edição: um slug existente pode já estar publicado em algum link. */
    startLocked?: boolean
}

/**
 * Preenche o slug a partir do título enquanto o usuário não tocar no campo.
 *
 * O controle é por INTENÇÃO, não por comparação de valor: verificar
 * `slug !== slugify(titulo)` falharia no momento em que alguém digitasse um
 * título cujo slug coincide com o que escreveu à mão, e não distingue "editei
 * o slug" de "editei o título e o efeito ainda não rodou".
 *
 * Apagar o campo inteiro reconecta a sincronia — é a saída que as pessoas
 * tentam naturalmente.
 */
export function useSlugSync({ source, setSlug, startLocked = false }: UseSlugSyncOptions) {
    const isManuallyEdited = useRef(startLocked)
    const [isLocked, setIsLocked] = useState(startLocked)

    useEffect(() => {
        if (!isManuallyEdited.current) {
            setSlug(slugify(source))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source])

    const onSlugManualChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value

            // Campo vazio volta a seguir o título automaticamente.
            isManuallyEdited.current = value !== ''
            setIsLocked(value !== '')
            setSlug(value)
        },
        [setSlug],
    )

    const regenerateFromSource = useCallback(() => {
        isManuallyEdited.current = false
        setIsLocked(false)
        setSlug(slugify(source))
    }, [source, setSlug])

    return { isLocked, onSlugManualChange, regenerateFromSource }
}
