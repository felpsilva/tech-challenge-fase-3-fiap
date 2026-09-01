import { makeDeletePostThumbnailUseCase } from '@/use-cases/factory/make-delete-post-thumbnail-use-case';
import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

export async function removeThumbnail(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.coerce.number(),
    })

    const { id } = paramsSchema.parse(request.params)

    const deletePostThumbnailUseCase = makeDeletePostThumbnailUseCase()

    try {
        const deleted = await deletePostThumbnailUseCase.handler(id)

        if (!deleted) {
            return reply.status(404).send({ message: 'Thumbnail not found' })
        }

        return reply.status(204).send()
    } catch (error) {
        console.error('Error deleting post thumbnail:', error)
        return reply.status(500).send({ message: 'Error deleting post thumbnail' })
    }
}
