/** Dobra acento decompondo em NFD e removendo as marcas combinantes. */
export function deaccent(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * "Matemática" -> "matematica", "Introdução à Física" -> "introducao-a-fisica",
 * "Ciências & Tecnologia" -> "ciencias-e-tecnologia".
 *
 * O NFD cobre todo o conjunto do português, inclusive o `ç`, que decompõe em
 * `c` + cedilha combinante.
 *
 * Corta em 200 e não em 255 para sobrar folga dentro do varchar(255) da
 * coluna. Vale registrar: o banco não tem índice único em `slug` e não existe
 * busca por slug, então duplicata aqui é inofensiva — o slug é metadado, não
 * identificador.
 */
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
