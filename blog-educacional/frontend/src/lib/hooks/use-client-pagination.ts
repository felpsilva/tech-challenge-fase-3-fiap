'use client'

import { useMemo, useState } from 'react'

/**
 * A API nao pagina nada — devolve array cru em toda listagem. Então a
 * paginação acontece aqui, em memória, sobre a lista completa.
 */
export function useClientPagination<T>(items: T[], pageSize = 9) {
    const [requestedPage, setRequestedPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

    // A pagina efetiva e DERIVADA, nao corrigida por efeito: filtrar de 40
    // para 2 itens estando na pagina 4 mostraria uma grade vazia — o bug
    // classico de paginacao no cliente. Derivar resolve sem render extra.
    const page = Math.min(requestedPage, totalPages)

    const pageItems = useMemo(
        () => items.slice((page - 1) * pageSize, page * pageSize),
        [items, page, pageSize],
    )

    return {
        page,
        pageSize,
        totalPages,
        totalItems: items.length,
        pageItems,
        setPage: setRequestedPage,
    }
}
