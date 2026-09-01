import { IPostImageRepository } from '@/repositories/post-image.repository.interface';

export class DeletePostThumbnailUseCase {
    constructor(private postImageRepository: IPostImageRepository) { }

    async handler(post_id: number): Promise<boolean> {
        return await this.postImageRepository.delete(post_id)
    }
}
