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
    app.get('/post', { preHandler: authorizeRoles(['admin', 'professor', 'aluno']) }, fetch)
    app.get('/post/search', { preHandler: authorizeRoles(['admin', 'professor', 'aluno']) }, search)
    app.get('/post/:id', { preHandler: authorizeRoles(['admin', 'professor', 'aluno']) }, get)
    app.put('/post/:id', { preHandler: authorizeRoles(['admin', 'professor']) }, update)
    app.delete('/post/:id', { preHandler: authorizeRoles(['admin', 'professor']) }, remove)

    app.post('/post/:id/thumbnail', { preHandler: authorizeRoles(['admin', 'professor']) }, uploadThumbnail)
    app.get('/post/:id/thumbnail', { preHandler: authorizeRoles(['admin', 'professor', 'aluno']) }, getThumbnail)
    app.delete('/post/:id/thumbnail', { preHandler: authorizeRoles(['admin', 'professor']) }, removeThumbnail)
}