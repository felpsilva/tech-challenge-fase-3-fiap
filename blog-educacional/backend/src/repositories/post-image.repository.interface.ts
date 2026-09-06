import { IPostImage, IPostImageMetadata } from '@/entities/models/post-image.interface';

export interface IPostImageRepository {
    upsert(image: IPostImage): Promise<IPostImageMetadata>
    findMetadataByPostId(post_id: number): Promise<IPostImageMetadata | null>
    findDataByPostId(post_id: number): Promise<IPostImage | null>
    delete(post_id: number): Promise<boolean>
}
