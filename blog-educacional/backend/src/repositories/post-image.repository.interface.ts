import { IPostImage, IPostImageMetadata } from '@/entities/models/post-image.interface';

export interface IPostImageRepository {
    /** Cria ou substitui a thumbnail do post. */
    upsert(image: IPostImage): Promise<IPostImageMetadata>
    /** Metadados apenas — nunca traz o binário. */
    findMetadataByPostId(post_id: number): Promise<IPostImageMetadata | null>
    /** Registro completo, com o binário. Use só na entrega do arquivo. */
    findDataByPostId(post_id: number): Promise<IPostImage | null>
    delete(post_id: number): Promise<boolean>
}
