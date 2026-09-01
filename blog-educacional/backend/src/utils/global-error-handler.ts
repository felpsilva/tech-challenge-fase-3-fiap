import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { env } from '@/env';

interface FastifyErrorLike extends Error {
    code?: string;
    statusCode?: number;
}

interface ErrorHandlerMap {
    [key: string]: (error: Error | ZodError, request: FastifyRequest, reply: FastifyReply) => void;
}

export const errorHandlerMap: ErrorHandlerMap = {
    ZodError: (error, _, reply) => {
        reply.status(400).send({
            statusCode: 400,
            message: 'Validation error',
            ... (error instanceof ZodError) && { error: error.format() }
        })
    },
    ResourceNotFoundError: (error, _, reply) => {
        return reply.status(404).send({ message: error.message })
    },
    InvalidCredentialsError: (error, _, reply) => {
        return reply.status(401).send({ message: error.message })
    },
    InvalidImageFileError: (error, _, reply) => {
        return reply.status(400).send({ message: error.message })
    }
};

export function globalErrorHandler(error: Error, _: FastifyRequest, reply: FastifyReply) {
    if (env.NODE_ENV === 'development') {
        console.error(error);
    }

    const fastifyError = error as FastifyErrorLike;
    if (fastifyError.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
        return reply.status(400).send({
            statusCode: 400,
            message: 'Must be a valid JSON object',
        });
    }

    if (fastifyError.statusCode && fastifyError.statusCode < 500) {
        return reply.status(fastifyError.statusCode).send({
            statusCode: fastifyError.statusCode,
            message: fastifyError.message,
        });
    }

    const handler = errorHandlerMap[error.constructor.name];
    if (handler) return handler(error, _, reply);

    return reply.status(500).send({ message: 'Internal server error' });
}