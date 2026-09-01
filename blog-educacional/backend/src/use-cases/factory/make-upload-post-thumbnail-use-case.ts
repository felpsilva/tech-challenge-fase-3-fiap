import { PostRepository } from '@/repositories/typeorm/post.repository';
import { PostImageRepository } from '@/repositories/typeorm/post-image.repository';
import { UploadPostThumbnailUseCase } from '../upload-post-thumbnail';

export function makeUploadPostThumbnailUseCase() {
    const postRepository = new PostRepository()
    const postImageRepository = new PostImageRepository()
    const uploadPostThumbnailUseCase = new UploadPostThumbnailUseCase(
        postRepository,
        postImageRepository,
    )

    return uploadPostThumbnailUseCase
}
