import * as yup from 'yup'
import { POST_STATUSES } from '@/types/post-status'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export const postFormSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required('Informe o título do post.')
        .max(255, 'O título passa de 255 caracteres.'),
    slug: yup
        .string()
        .trim()
        .required('O slug é obrigatório.')
        .max(255, 'O slug passa de 255 caracteres.')
        .matches(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen.'),
    content: yup.string().trim().required('Escreva o conteúdo do post.'),
    status: yup.string().oneOf(POST_STATUSES, 'Selecione um status válido.').required(),
    authorId: yup
        .number()
        .integer()
        .positive('Selecione o autor do post.')
        .required('Selecione o autor do post.'),
    imageUrl: yup
        .string()
        .trim()
        .max(255, 'A URL passa de 255 caracteres.')
        .url('Informe uma URL válida (começando com http).')
        .optional(),
    categoryIds: yup.array().of(yup.number().required()).default([]),
    thumbnailFile: yup
        .mixed<File>()
        .nullable()
        .test('size', 'A imagem deve ter no máximo 2 MB.', (file) =>
            !file || file.size <= MAX_IMAGE_BYTES)
        .test('type', 'Formatos aceitos: JPEG, PNG ou WebP.', (file) =>
            !file || ACCEPTED_IMAGE_TYPES.includes(file.type))
        .optional(),
})
