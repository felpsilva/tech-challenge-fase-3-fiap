export function toExcerpt(content: string, maxChars = 280) {
    const flattened = content
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#*_`>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    if (flattened.length <= maxChars) {
        return flattened
    }

    const cut = flattened.slice(0, maxChars)
    const lastSpace = cut.lastIndexOf(' ')

    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
