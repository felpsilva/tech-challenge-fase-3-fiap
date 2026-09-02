const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
})

export function formatDate(value: string) {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? '' : formatter.format(date)
}
