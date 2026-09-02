import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-errors';
import { makeSignInUseCase } from '@/use-cases/factory/make-signin-use-case';
import { compare } from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

export async function signin(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        username: z.string(),
        password: z.string()
    });

    const { username, password } = registerBodySchema.parse(request.body);

    const signInUseCase = makeSignInUseCase();

    const user = await signInUseCase.handler(username);

    const doesPasswordMatch = await compare(password, user.password);

    if (!doesPasswordMatch) {
        throw new InvalidCredentialsError();
    };

    // O `id` vai nas claims porque o frontend precisa dele para montar o
    // `user_id` do post, e a rota que lista usuarios e restrita a admin.
    const token = await reply.jwtSign({ id: user.id!, username, permission: user.permission });

    return reply.status(200).send({ token });
}
