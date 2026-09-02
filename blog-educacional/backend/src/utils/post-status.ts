/**
 * O banco guarda `status` como varchar sem enum e o Zod aceita qualquer
 * string, entao o vocabulario vive aqui. Serve para uma coisa so: decidir o
 * que um visitante sem token pode ver.
 */
export const PUBLISHED_STATUS = 'published'

export function isPublished(status: string) {
    return status === PUBLISHED_STATUS
}
