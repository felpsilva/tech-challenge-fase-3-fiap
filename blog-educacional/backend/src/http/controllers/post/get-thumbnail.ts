import { makeGetPostThumbnailUseCase } from '@/use-cases/factory/make-get-post-thumbnail-use-case';
import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

export async function getThumbnail(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.coerce.number(),
    })

    const { id } = paramsSchema.parse(request.params)

    const getPostThumbnailUseCase = makeGetPostThumbnailUseCase()

    try {
        const thumbnail = await getPostThumbnailUseCase.handler(id)

        if (!thumbnail) {
            return reply.status(404).send({ message: 'Thumbnail not found' })
        }

        // O binário sai cru, com o seu próprio Content-Type. Serializar o
        // Buffer em JSON custaria ~33% a mais e forçaria decode no cliente.
        return reply
            .status(200)
            .header('Content-Type', thumbnail.mime_type)
            .header('Content-Length', thumbnail.size_bytes)
            .header('Content-Disposition', `inline; filename="${thumbnail.filename}"`)
            .send(thumbnail.data)
    } catch (error) {
        console.error('Error getting post thumbnail:', error)
        return reply.status(500).send({ message: 'Error getting post thumbnail' })
    }
}
