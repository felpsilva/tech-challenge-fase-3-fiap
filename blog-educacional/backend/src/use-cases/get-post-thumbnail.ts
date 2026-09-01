import { IPostImage } from '@/entities/models/post-image.interface';
import { IPostImageRepository } from '@/repositories/post-image.repository.interface';

export class GetPostThumbnailUseCase {
    constructor(private postImageRepository: IPostImageRepository) { }

    async handler(post_id: number): Promise<IPostImage | null> {
        return await this.postImageRepository.findDataByPostId(post_id)
    }
}
