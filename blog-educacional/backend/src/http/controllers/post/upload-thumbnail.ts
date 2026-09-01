import { makeUploadPostThumbnailUseCase } from '@/use-cases/factory/make-upload-post-thumbnail-use-case';
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { InvalidImageFileError } from '@/use-cases/errors/invalid-image-file-error';
import { MAX_THUMBNAIL_SIZE_BYTES } from '@/utils/image-file';
import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

export async function uploadThumbnail(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.coerce.number(),
    })

    const { id } = paramsSchema.parse(request.params)

    if (!request.isMultipart()) {
        return reply.status(415).send({ message: 'Content-Type must be multipart/form-data' })
    }

    const file = await request.file()

    if (!file) {
        return reply.status(400).send({ message: 'Image file is required' })
    }

    let data: Buffer

    try {
        data = await file.toBuffer()
    } catch (error) {
        const uploadError = error as { code?: string }

        if (uploadError.code === 'FST_REQ_FILE_TOO_LARGE') {
            return reply.status(413).send({
                message: `Image file exceeds the ${MAX_THUMBNAIL_SIZE_BYTES} bytes limit`,
            })
        }

        throw error
    }

    const uploadPostThumbnailUseCase = makeUploadPostThumbnailUseCase()

    try {
        const thumbnail = await uploadPostThumbnailUseCase.handler({
            post_id: id,
            filename: file.filename,
            data,
        })

        return reply.status(201).send(thumbnail)
    } catch (error) {
        if (error instanceof InvalidImageFileError) {
            return reply.status(400).send({ message: error.message })
        }

        if (error instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Post not found' })
        }

        console.error('Error uploading post thumbnail:', error)
        return reply.status(500).send({ message: 'Error uploading post thumbnail' })
    }
}
