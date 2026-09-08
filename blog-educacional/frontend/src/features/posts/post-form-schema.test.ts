import { postFormSchema, MAX_IMAGE_BYTES } from './post-form-schema'

const baseValues = {
    title: 'Título do post',
    slug: 'titulo-do-post',
    content: 'Conteúdo do post.',
    status: 'draft' as const,
    authorId: 1,
    imageUrl: '',
    categoryIds: [] as number[],
    thumbnailFile: null as File | null,
}

function fakeFile(type: string, size: number) {
    const file = new File(['x'], 'imagem', { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
}

describe('postFormSchema', () => {
    it('valida a edição sem reenviar arquivo, mantendo a imagem já salva', async () => {
        await expect(postFormSchema.validate(baseValues)).resolves.toMatchObject({
            thumbnailFile: null,
        })
    })

    it('aceita um arquivo dentro dos limites', async () => {
        const thumbnailFile = fakeFile('image/png', 1024)

        await expect(
            postFormSchema.validate({ ...baseValues, thumbnailFile }),
        ).resolves.toMatchObject({ thumbnailFile })
    })

    it('recusa arquivo acima de 2 MB', async () => {
        const thumbnailFile = fakeFile('image/png', MAX_IMAGE_BYTES + 1)

        await expect(
            postFormSchema.validate({ ...baseValues, thumbnailFile }),
        ).rejects.toThrow('A imagem deve ter no máximo 2 MB.')
    })

    it('recusa formato não suportado', async () => {
        const thumbnailFile = fakeFile('image/gif', 1024)

        await expect(
            postFormSchema.validate({ ...baseValues, thumbnailFile }),
        ).rejects.toThrow('Formatos aceitos: JPEG, PNG ou WebP.')
    })
})
