import { makeFetchPostsUseCase } from '@/use-cases/factory/make-fetch-posts-use-case';
import { isPublished } from '@/utils/post-status';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function fetch(request: FastifyRequest, reply: FastifyReply) {
    const fetchPostsUseCase = makeFetchPostsUseCase()

    try {
        const posts = await fetchPostsUseCase.handler()

        // A rota e publica, mas rascunho nao e conteudo publicado: sem token
        // valido a listagem devolve so o que esta no ar.
        if (!request.user) {
            return reply.status(200).send(posts.filter((post) => isPublished(post.status)))
        }

        return reply.status(200).send(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        return reply.status(500).send({ message: 'Error fetching posts' })
    }
}