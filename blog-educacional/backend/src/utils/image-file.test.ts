import { detectImageMimeType, sanitizeFilename } from './image-file'
import { JPEG_BYTES, PNG_BYTES, WEBP_BYTES } from '@/test/helpers/multipart'

describe('detectImageMimeType', () => {
    it.each([
        ['image/png', PNG_BYTES],
        ['image/jpeg', JPEG_BYTES],
        ['image/webp', WEBP_BYTES],
    ])('detects %s', (mime, bytes) => {
        expect(detectImageMimeType(bytes)).toBe(mime)
    })

    it('returns null for a non-image buffer', () => {
        expect(detectImageMimeType(Buffer.from('%PDF-1.4'))).toBeNull()
    })

    it('returns null for a RIFF container that is not WebP', () => {
        const riffWave = Buffer.concat([
            Buffer.from('RIFF'),
            Buffer.from([0x00, 0x00, 0x00, 0x00]),
            Buffer.from('WAVE'),
        ])

        expect(detectImageMimeType(riffWave)).toBeNull()
    })

    it('returns null for a buffer shorter than any signature', () => {
        expect(detectImageMimeType(Buffer.from([0x89]))).toBeNull()
    })
})

describe('sanitizeFilename', () => {
    it('keeps a plain filename untouched', () => {
        expect(sanitizeFilename('minha thumb.png')).toBe('minha thumb.png')
    })

    it('drops directories from unix and windows paths', () => {
        expect(sanitizeFilename('/var/tmp/thumb.png')).toBe('thumb.png')
        expect(sanitizeFilename('C:\\temp\\thumb.png')).toBe('thumb.png')
    })

    it('falls back to a default when nothing usable remains', () => {
        expect(sanitizeFilename('///')).toBe('thumbnail')
        expect(sanitizeFilename('$$$')).toBe('thumbnail')
    })

    it('truncates to the column length', () => {
        expect(sanitizeFilename(`${'a'.repeat(300)}.png`)).toHaveLength(255)
    })
})
