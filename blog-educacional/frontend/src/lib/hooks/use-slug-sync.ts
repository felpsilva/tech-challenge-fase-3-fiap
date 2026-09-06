'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { slugify } from '@/lib/utils/slugify'

interface UseSlugSyncOptions {
    source: string
    setSlug: (value: string) => void
    startLocked?: boolean
}

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
