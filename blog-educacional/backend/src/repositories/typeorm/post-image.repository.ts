import { PostImage } from '@/entities/post-image.entity';
import { IPostImage, IPostImageMetadata } from '@/entities/models/post-image.interface';
import { IPostImageRepository } from '../post-image.repository.interface';
import { Repository } from 'typeorm';
import { appDataSource } from '@/lib/typeorm/typeorm';

function toMetadata(image: PostImage): IPostImageMetadata {
    return {
        post_id: image.post_id,
        filename: image.filename,
        mime_type: image.mime_type,
        size_bytes: image.size_bytes,
        ...(image.created_at ? { created_at: image.created_at } : {}),
        ...(image.updated_at ? { updated_at: image.updated_at } : {}),
    }
}

export class PostImageRepository implements IPostImageRepository {
    private repository: Repository<PostImage>

    constructor() {
        this.repository = appDataSource.getRepository(PostImage)
    }

    async upsert(image: IPostImage): Promise<IPostImageMetadata> {
        const now = new Date()
        const existing = await this.repository.findOne({
            where: { post_id: image.post_id },
        })

        const entity = this.repository.create({
            ...image,
            created_at: existing?.created_at ?? now,
            updated_at: now,
        })

        const saved = await this.repository.save(entity)

        return toMetadata(saved)
    }

    async findMetadataByPostId(post_id: number): Promise<IPostImageMetadata | null> {
        // `data` tem select: false na entidade, então este find já vem leve.
        const image = await this.repository.findOne({ where: { post_id } })

        return image ? toMetadata(image) : null
    }

    async findDataByPostId(post_id: number): Promise<IPostImage | null> {
        const image = await this.repository
            .createQueryBuilder('post_image')
            .addSelect('post_image.data')
            .where('post_image.post_id = :post_id', { post_id })
            .getOne()

        return image
    }

    async delete(post_id: number): Promise<boolean> {
        const result = await this.repository.delete({ post_id })

        return !!result.affected && result.affected > 0
    }
}
