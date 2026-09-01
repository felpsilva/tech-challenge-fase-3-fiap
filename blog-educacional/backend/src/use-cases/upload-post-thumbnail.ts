import { IPostImageMetadata } from '@/entities/models/post-image.interface';
import { IPostImageRepository } from '@/repositories/post-image.repository.interface';
import { IPostRepository } from '@/repositories/post.repository.interface';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { InvalidImageFileError } from './errors/invalid-image-file-error';
import {
    ACCEPTED_IMAGE_MIME_TYPES,
    MAX_THUMBNAIL_SIZE_BYTES,
    detectImageMimeType,
    sanitizeFilename,
} from '@/utils/image-file';

interface UploadPostThumbnailInput {
    post_id: number
    filename: string
    data: Buffer
}

export class UploadPostThumbnailUseCase {
    constructor(
        private postRepository: IPostRepository,
        private postImageRepository: IPostImageRepository,
    ) { }

    async handler({ post_id, filename, data }: UploadPostThumbnailInput): Promise<IPostImageMetadata> {
        if (data.length === 0) {
            throw new InvalidImageFileError('Empty image file')
        }

        if (data.length > MAX_THUMBNAIL_SIZE_BYTES) {
            throw new InvalidImageFileError(
                `Image file exceeds the ${MAX_THUMBNAIL_SIZE_BYTES} bytes limit`,
            )
        }

        const mime_type = detectImageMimeType(data)

        if (!mime_type) {
            throw new InvalidImageFileError(
                `Unsupported image format. Accepted: ${ACCEPTED_IMAGE_MIME_TYPES.join(', ')}`,
            )
        }

        const post = await this.postRepository.findById(post_id)

        if (!post) {
            throw new ResourceNotFoundError()
        }

        return await this.postImageRepository.upsert({
            post_id,
            filename: sanitizeFilename(filename),
            mime_type,
            size_bytes: data.length,
            data,
        })
    }
}
