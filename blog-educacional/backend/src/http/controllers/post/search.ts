import { makeSearchPostsUseCase } from '@/use-cases/factory/make-search-posts-use-case';
import { isPublished } from '@/utils/post-status';
import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

export async function search(request: FastifyRequest, reply: FastifyReply) {
    const searchQuerySchema = z.object({
        q: z.string().min(1),
    })

    const { q } = searchQuerySchema.parse(request.query)

    const searchPostsUseCase = makeSearchPostsUseCase()

    try {
        const posts = await searchPostsUseCase.handler(q)

        if (!request.user) {
            return reply.status(200).send(posts.filter((post) => isPublished(post.status)))
        }

        return reply.status(200).send(posts)
    } catch (error) {
        console.error('Error searching posts:', error)
        return reply.status(500).send({ message: 'Error searching posts' })
    }
}