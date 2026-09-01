import { PostImageRepository } from '@/repositories/typeorm/post-image.repository';
import { DeletePostThumbnailUseCase } from '../delete-post-thumbnail';

export function makeDeletePostThumbnailUseCase() {
    const postImageRepository = new PostImageRepository()
    const deletePostThumbnailUseCase = new DeletePostThumbnailUseCase(postImageRepository)

    return deletePostThumbnailUseCase
}
