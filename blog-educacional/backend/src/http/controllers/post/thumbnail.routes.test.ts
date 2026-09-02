import fastifyMultipart from '@fastify/multipart'
import { uploadThumbnail } from './upload-thumbnail'
import { getThumbnail } from './get-thumbnail'
import { removeThumbnail } from './delete-thumbnail'
import { authorizeRoles } from '@/http/middlewares/authorize-roles'
import { createAuthenticatedTestApp } from '@/test/helpers/authenticated-test-app'
import {
    PNG_BYTES,
    buildFieldPayload,
    buildFilePayload,
    multipartHeaders,
} from '@/test/helpers/multipart'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { InvalidImageFileError } from '@/use-cases/errors/invalid-image-file-error'
import { MAX_THUMBNAIL_SIZE_BYTES } from '@/utils/image-file'
import { jest } from '@jest/globals'

const mockUploadHandler = jest.fn() as jest.MockedFunction<(input: any) => Promise<any>>
const mockGetHandler = jest.fn() as jest.MockedFunction<(post_id: number) => Promise<any>>
const mockDeleteHandler = jest.fn() as jest.MockedFunction<(post_id: number) => Promise<boolean>>

jest.mock('@/use-cases/factory/make-upload-post-thumbnail-use-case', () => ({
    makeUploadPostThumbnailUseCase: jest.fn(() => ({
        handler: mockUploadHandler,
    })),
}))

jest.mock('@/use-cases/factory/make-get-post-thumbnail-use-case', () => ({
    makeGetPostThumbnailUseCase: jest.fn(() => ({
        handler: mockGetHandler,
    })),
}))

jest.mock('@/use-cases/factory/make-delete-post-thumbnail-use-case', () => ({
    makeDeletePostThumbnailUseCase: jest.fn(() => ({
        handler: mockDeleteHandler,
    })),
}))

describe('Post thumbnail routes', () => {
    let app: Awaited<ReturnType<typeof createAuthenticatedTestApp>>['app']
    let headers: Awaited<ReturnType<typeof createAuthenticatedTestApp>>['headers']

    beforeAll(async () => {
        const testApp = await createAuthenticatedTestApp(async (appInstance) => {
            await appInstance.register(fastifyMultipart, {
                limits: {
                    fileSize: MAX_THUMBNAIL_SIZE_BYTES,
                    files: 1,
                },
            })

            appInstance.post(
                '/post/:id/thumbnail',
                { preHandler: authorizeRoles(['admin', 'professor']) },
                uploadThumbnail,
            )
            // Espelha `post/routes.ts`: entregar o arquivo e publico, porque
            // uma tag <img> nao manda header Authorization.
            appInstance.get('/post/:id/thumbnail', getThumbnail)
            appInstance.delete(
                '/post/:id/thumbnail',
                { preHandler: authorizeRoles(['admin', 'professor']) },
                removeThumbnail,
            )
        })

        app = testApp.app
        headers = testApp.headers
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        mockUploadHandler.mockReset()
        mockGetHandler.mockReset()
        mockDeleteHandler.mockReset()
    })

    it('uploads a thumbnail and returns its metadata', async () => {
        const metadata = {
            post_id: 1,
            filename: 'thumb.png',
            mime_type: 'image/png',
            size_bytes: PNG_BYTES.length,
        }

        mockUploadHandler.mockResolvedValueOnce(metadata)

        const response = await app.inject({
            method: 'POST',
            url: '/post/1/thumbnail',
            headers: { ...headers, ...multipartHeaders },
            payload: buildFilePayload({
                name: 'file',
                filename: 'thumb.png',
                contentType: 'image/png',
                value: PNG_BYTES,
            }),
        })

        expect(response.statusCode).toBe(201)
        expect(JSON.parse(response.payload)).toEqual(metadata)
        expect(mockUploadHandler).toHaveBeenCalledTimes(1)

        const input = mockUploadHandler.mock.calls[0]?.[0]
        expect(input.post_id).toBe(1)
        expect(input.filename).toBe('thumb.png')
        expect(Buffer.compare(input.data, PNG_BYTES)).toBe(0)
    })

    it('returns 415 when the request is not multipart', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/post/1/thumbnail',
            headers,
            payload: { file: 'not-a-file' },
        })

        expect(response.statusCode).toBe(415)
        expect(mockUploadHandler).not.toHaveBeenCalled()
    })

    it('returns 400 when no file part is sent', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/post/1/thumbnail',
            headers: { ...headers, ...multipartHeaders },
            payload: buildFieldPayload('title', 'sem arquivo'),
        })

        expect(response.statusCode).toBe(400)
        expect(JSON.parse(response.payload)).toEqual({ message: 'Image file is required' })
        expect(mockUploadHandler).not.toHaveBeenCalled()
    })

    it('returns 400 when the use case rejects the file', async () => {
        mockUploadHandler.mockRejectedValueOnce(
            new InvalidImageFileError('Unsupported image format'),
        )

        const response = await app.inject({
            method: 'POST',
            url: '/post/1/thumbnail',
            headers: { ...headers, ...multipartHeaders },
            payload: buildFilePayload({
                name: 'file',
                filename: 'doc.pdf',
                contentType: 'image/png',
                value: Buffer.from('%PDF-1.4 conteudo'),
            }),
        })

        expect(response.statusCode).toBe(400)
        expect(JSON.parse(response.payload)).toEqual({ message: 'Unsupported image format' })
    })

    it('returns 404 when the post does not exist', async () => {
        mockUploadHandler.mockRejectedValueOnce(new ResourceNotFoundError())

        const response = await app.inject({
            method: 'POST',
            url: '/post/999/thumbnail',
            headers: { ...headers, ...multipartHeaders },
            payload: buildFilePayload({
                name: 'file',
                filename: 'thumb.png',
                contentType: 'image/png',
                value: PNG_BYTES,
            }),
        })

        expect(response.statusCode).toBe(404)
        expect(JSON.parse(response.payload)).toEqual({ message: 'Post not found' })
    })

    it('serves the thumbnail as raw binary', async () => {
        mockGetHandler.mockResolvedValueOnce({
            post_id: 1,
            filename: 'thumb.png',
            mime_type: 'image/png',
            size_bytes: PNG_BYTES.length,
            data: PNG_BYTES,
        })

        const response = await app.inject({
            method: 'GET',
            url: '/post/1/thumbnail',
            headers,
        })

        expect(response.statusCode).toBe(200)
        expect(response.headers['content-type']).toBe('image/png')
        expect(response.headers['content-length']).toBe(String(PNG_BYTES.length))
        expect(response.headers['content-disposition']).toBe('inline; filename="thumb.png"')
        expect(Buffer.compare(response.rawPayload, PNG_BYTES)).toBe(0)
        expect(mockGetHandler).toHaveBeenCalledWith(1)
    })

    it('returns 404 when the post has no thumbnail', async () => {
        mockGetHandler.mockResolvedValueOnce(null)

        const response = await app.inject({
            method: 'GET',
            url: '/post/1/thumbnail',
            headers,
        })

        expect(response.statusCode).toBe(404)
        expect(JSON.parse(response.payload)).toEqual({ message: 'Thumbnail not found' })
    })

    it('deletes a thumbnail', async () => {
        mockDeleteHandler.mockResolvedValueOnce(true)

        const response = await app.inject({
            method: 'DELETE',
            url: '/post/1/thumbnail',
            headers,
        })

        expect(response.statusCode).toBe(204)
        expect(response.payload).toBe('')
        expect(mockDeleteHandler).toHaveBeenCalledWith(1)
    })

    it('returns 404 when deleting a thumbnail that does not exist', async () => {
        mockDeleteHandler.mockResolvedValueOnce(false)

        const response = await app.inject({
            method: 'DELETE',
            url: '/post/1/thumbnail',
            headers,
        })

        expect(response.statusCode).toBe(404)
    })
})
