export const PUBLISHED_STATUS = 'published'

export function isPublished(status: string) {
    return status === PUBLISHED_STATUS
}
