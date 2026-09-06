// A validacao e feita pelo conteudo, nao pelo content-type do multipart: o cliente
// controla o header, mas nao os primeiros bytes.
const IMAGE_SIGNATURES = [
    {
        mime: 'image/jpeg',
        matches: (buffer: Buffer) =>
            buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    },
    {
        mime: 'image/png',
        matches: (buffer: Buffer) =>
            buffer
                .subarray(0, 8)
                .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    },
    {
        mime: 'image/webp',
        matches: (buffer: Buffer) =>
            buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
            buffer.subarray(8, 12).toString('ascii') === 'WEBP',
    },
] as const

export const ACCEPTED_IMAGE_MIME_TYPES = IMAGE_SIGNATURES.map((signature) => signature.mime)

export const MAX_THUMBNAIL_SIZE_BYTES = 2 * 1024 * 1024

export function detectImageMimeType(buffer: Buffer): string | null {
    const signature = IMAGE_SIGNATURES.find((item) => item.matches(buffer))

    return signature ? signature.mime : null
}

export function sanitizeFilename(filename: string): string {
    const base = filename.split(/[\\/]/).pop() ?? 'thumbnail'
    const cleaned = base.replace(/[^\w.\-\s]/g, '').trim()

    return (cleaned || 'thumbnail').slice(0, 255)
}
