/**
 * Monta um corpo multipart/form-data para uso com app.inject, evitando
 * uma dependência extra só para os testes de upload.
 */
export const MULTIPART_BOUNDARY = '----BlogEducacionalTestBoundary'

export const multipartHeaders = {
    'content-type': `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`,
}

interface FilePart {
    name: string
    filename: string
    contentType: string
    value: Buffer
}

export function buildFilePayload({ name, filename, contentType, value }: FilePart): Buffer {
    const header = Buffer.from(
        `--${MULTIPART_BOUNDARY}\r\n` +
        `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
        `Content-Type: ${contentType}\r\n\r\n`,
    )
    const footer = Buffer.from(`\r\n--${MULTIPART_BOUNDARY}--\r\n`)

    return Buffer.concat([header, value, footer])
}

export function buildFieldPayload(name: string, value: string): Buffer {
    return Buffer.from(
        `--${MULTIPART_BOUNDARY}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n` +
        `--${MULTIPART_BOUNDARY}--\r\n`,
    )
}

/** Bytes que passam pela checagem de magic number de cada formato. */
export const PNG_BYTES = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.from('conteudo-fake-png'),
])

export const JPEG_BYTES = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff]),
    Buffer.from('conteudo-fake-jpeg'),
])

export const WEBP_BYTES = Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from('WEBP'),
    Buffer.from('conteudo-fake-webp'),
])
