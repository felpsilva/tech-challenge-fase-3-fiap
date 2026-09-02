import 'reflect-metadata'
import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import '@/lib/typeorm/typeorm'
import { userRoutes } from '@/http/controllers/user/routes';
import { postRoutes } from '@/http/controllers/post/routes';
import { categoryRoutes } from './http/controllers/category/routes';
import { env } from './env';
import { validateJwt } from './http/middlewares/jwt-validate';
import { globalErrorHandler } from './utils/global-error-handler';
import { MAX_THUMBNAIL_SIZE_BYTES } from './utils/image-file';

export const app = fastify()

// O CORS entra antes de tudo: sem ele o browser nem chega a mandar a
// requisicao real. A origem vem do env porque dev (localhost:3000) e o
// dominio publicado sao diferentes.
app.register(fastifyCors, {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    // O default do plugin e so GET,HEAD,POST — sem ampliar, o preflight de
    // PUT e DELETE e recusado e a area administrativa nao funciona.
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // Content-Disposition nao e safelisted: sem expor, o browser nao le o
    // filename que o GET da thumbnail devolve.
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
})

app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: '1h' }
})

app.register(fastifyMultipart, {
    limits: {
        fileSize: MAX_THUMBNAIL_SIZE_BYTES,
        files: 1,
    },
})

app.addHook('onRequest', validateJwt)
app.setErrorHandler(globalErrorHandler)

app.register(userRoutes)
app.register(postRoutes)
app.register(categoryRoutes)