import { PostImageRepository } from '@/repositories/typeorm/post-image.repository';
import { GetPostThumbnailUseCase } from '../get-post-thumbnail';

export function makeGetPostThumbnailUseCase() {
    const postImageRepository = new PostImageRepository()
    const getPostThumbnailUseCase = new GetPostThumbnailUseCase(postImageRepository)

    return getPostThumbnailUseCase
}
