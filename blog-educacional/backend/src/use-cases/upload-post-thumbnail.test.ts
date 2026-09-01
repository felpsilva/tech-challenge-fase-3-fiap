import { UploadPostThumbnailUseCase } from './upload-post-thumbnail'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InvalidImageFileError } from './errors/invalid-image-file-error'
import { MAX_THUMBNAIL_SIZE_BYTES } from '@/utils/image-file'
import { IPostImage, IPostImageMetadata } from '@/entities/models/post-image.interface'
import { IPostImageRepository } from '@/repositories/post-image.repository.interface'
import { IPostRepository } from '@/repositories/post.repository.interface'
import { IPost } from '@/entities/models/post.interface'
import { JPEG_BYTES, PNG_BYTES, WEBP_BYTES } from '@/test/helpers/multipart'

class InMemoryPostRepository implements IPostRepository {
    posts = new Map<number, IPost>()

    async create(post: IPost): Promise<IPost> {
        this.posts.set(post.id!, post)
        return post
    }
    async findAll(): Promise<IPost[]> {
        return Array.from(this.posts.values())
    }
    async findById(id: number): Promise<IPost | null> {
        return this.posts.get(id) ?? null
    }
    async search(): Promise<IPost[]> {
        return []
    }
    async update(): Promise<IPost | null> {
        return null
    }
    async delete(): Promise<boolean> {
        return false
    }
}

function toMetadata(image: IPostImage): IPostImageMetadata {
    return {
        post_id: image.post_id,
        filename: image.filename,
        mime_type: image.mime_type,
        size_bytes: image.size_bytes,
    }
}

class InMemoryPostImageRepository implements IPostImageRepository {
    images = new Map<number, IPostImage>()

    async upsert(image: IPostImage): Promise<IPostImageMetadata> {
        this.images.set(image.post_id, image)
        return toMetadata(image)
    }
    async findMetadataByPostId(post_id: number): Promise<IPostImageMetadata | null> {
        const image = this.images.get(post_id)
        return image ? toMetadata(image) : null
    }
    async findDataByPostId(post_id: number): Promise<IPostImage | null> {
        return this.images.get(post_id) ?? null
    }
    async delete(post_id: number): Promise<boolean> {
        return this.images.delete(post_id)
    }
}

describe('UploadPostThumbnailUseCase', () => {
    let postRepository: InMemoryPostRepository
    let postImageRepository: InMemoryPostImageRepository
    let sut: UploadPostThumbnailUseCase

    beforeEach(async () => {
        postRepository = new InMemoryPostRepository()
        postImageRepository = new InMemoryPostImageRepository()
        sut = new UploadPostThumbnailUseCase(postRepository, postImageRepository)

        await postRepository.create({
            id: 1,
            user_id: 7,
            title: 'Post com thumbnail',
            slug: 'post-com-thumbnail',
            content: 'Conteúdo',
            status: 'draft',
        })
    })

    it.each([
        ['image/png', PNG_BYTES],
        ['image/jpeg', JPEG_BYTES],
        ['image/webp', WEBP_BYTES],
    ])('stores a %s file and derives its mime type from the content', async (mime, bytes) => {
        const metadata = await sut.handler({
            post_id: 1,
            filename: 'thumb.bin',
            data: bytes,
        })

        expect(metadata).toEqual({
            post_id: 1,
            filename: 'thumb.bin',
            mime_type: mime,
            size_bytes: bytes.length,
        })
        expect(postImageRepository.images.get(1)?.data).toBe(bytes)
    })

    it('replaces the previous thumbnail instead of creating a second one', async () => {
        await sut.handler({ post_id: 1, filename: 'primeira.png', data: PNG_BYTES })
        await sut.handler({ post_id: 1, filename: 'segunda.jpg', data: JPEG_BYTES })

        expect(postImageRepository.images.size).toBe(1)
        expect(postImageRepository.images.get(1)?.filename).toBe('segunda.jpg')
        expect(postImageRepository.images.get(1)?.mime_type).toBe('image/jpeg')
    })

    it('strips path segments from the filename sent by the client', async () => {
        const metadata = await sut.handler({
            post_id: 1,
            filename: '../../etc/passwd.png',
            data: PNG_BYTES,
        })

        expect(metadata.filename).toBe('passwd.png')
    })

    it('rejects a file whose content is not a supported image', async () => {
        await expect(
            sut.handler({
                post_id: 1,
                filename: 'documento.png',
                data: Buffer.from('%PDF-1.4 este arquivo mente sobre o formato'),
            }),
        ).rejects.toBeInstanceOf(InvalidImageFileError)

        expect(postImageRepository.images.size).toBe(0)
    })

    it('rejects an empty file', async () => {
        await expect(
            sut.handler({ post_id: 1, filename: 'vazio.png', data: Buffer.alloc(0) }),
        ).rejects.toBeInstanceOf(InvalidImageFileError)
    })

    it('rejects a file above the size limit', async () => {
        const oversized = Buffer.concat([
            PNG_BYTES,
            Buffer.alloc(MAX_THUMBNAIL_SIZE_BYTES),
        ])

        await expect(
            sut.handler({ post_id: 1, filename: 'grande.png', data: oversized }),
        ).rejects.toBeInstanceOf(InvalidImageFileError)

        expect(postImageRepository.images.size).toBe(0)
    })

    it('rejects an upload for a post that does not exist', async () => {
        await expect(
            sut.handler({ post_id: 999, filename: 'thumb.png', data: PNG_BYTES }),
        ).rejects.toBeInstanceOf(ResourceNotFoundError)

        expect(postImageRepository.images.size).toBe(0)
    })
})
