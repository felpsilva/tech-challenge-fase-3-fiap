'use client'

import { useMemo, useState } from 'react'

export function useClientPagination<T>(items: T[], pageSize = 9) {
    const [requestedPage, setRequestedPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

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
