import { IPost } from '@/entities/models/post.interface';
import { makeUpdatePostUseCase } from '@/use-cases/factory/make-update-post-use-case';
import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

export async function update(request: FastifyRequest, reply: FastifyReply) {
    const updateParamsSchema = z.object({
        id: z.coerce.number(),
    })

    const updateBodySchema = z.object({
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        image_url: z.string().optional(),
        status: z.string().optional(),
        categories: z.array(z.object({
            id: z.coerce.number(),
            name: z.string().optional(),
            slug: z.string().optional(),
        })).optional(),
    })

    const { id } = updateParamsSchema.parse(request.params)
    const data = updateBodySchema.parse(request.body)

    const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Partial<IPost>

    const updatePostUseCase = makeUpdatePostUseCase()

    try {
        const post = await updatePostUseCase.handler(id, updateData)

        if (!post) {
            return reply.status(404).send({ message: 'Post not found' })
        }

        return reply.status(200).send(post)
    } catch (error) {
        console.error('Error updating post:', error)
        return reply.status(500).send({ message: 'Error updating post' })
    }
}