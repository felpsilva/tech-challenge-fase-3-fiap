export function deaccent(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function slugify(value: string) {
    return deaccent(value)
        .toLowerCase()
        .replace(/[‘’“”']/g, '')
        .replace(/&/g, ' e ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200)
        .replace(/-+$/, '')
}
