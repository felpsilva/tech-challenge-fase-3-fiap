import { FastifyInstance } from 'fastify';
import { create } from './create';
import { fetch } from './fetch';
import { search } from './search';
import { get } from './get';
import { update } from './update';
import { remove } from './delete';
import { uploadThumbnail } from './upload-thumbnail';
import { getThumbnail } from './get-thumbnail';
import { removeThumbnail } from './delete-thumbnail';
import { authorizeRoles } from '@/http/middlewares/authorize-roles';

export async function postRoutes(app: FastifyInstance) {
    app.post('/post', { preHandler: authorizeRoles(['admin', 'professor']) }, create)

    // Leitura liberada: o blog precisa ser lido por quem nao tem conta. A lista
    // de rotas publicas vive em `jwt-validate.ts` e precisa casar com estas.
    // Rascunho continua escondido de anonimo — o filtro esta nos controllers.
    app.get('/post', fetch)
    app.get('/post/search', search)
    app.get('/post/:id', get)
    app.put('/post/:id', { preHandler: authorizeRoles(['admin', 'professor']) }, update)
    app.delete('/post/:id', { preHandler: authorizeRoles(['admin', 'professor']) }, remove)

    app.post('/post/:id/thumbnail', { preHandler: authorizeRoles(['admin', 'professor']) }, uploadThumbnail)
    app.get('/post/:id/thumbnail', getThumbnail)
    app.delete('/post/:id/thumbnail', { preHandler: authorizeRoles(['admin', 'professor']) }, removeThumbnail)
}