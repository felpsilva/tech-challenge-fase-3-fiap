/**
 * Pré-corte do conteúdo para o resumo do cartão.
 *
 * Não é a truncagem visual — quem corta em duas linhas é o `line-clamp` no
 * CSS. Isto existe por dois motivos: manter o payload da home em ~280
 * caracteres por post em vez do artigo inteiro, e evitar que um `\n` no
 * começo do texto faça a primeira linha exibir uma palavra só.
 */
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
