import { Post } from '@/entities/post.entity';
import { Category } from '@/entities/category.entity';
import { IPostRepository } from '../post.repository.interface';
import { ILike, In, Repository } from 'typeorm';
import { appDataSource } from '@/lib/typeorm/typeorm';
import { IPost } from '@/entities/models/post.interface';

export class PostRepository implements IPostRepository {
    private repository: Repository<Post>
    private categoryRepository: Repository<Category>

    constructor() {
        this.repository = appDataSource.getRepository(Post)
        this.categoryRepository = appDataSource.getRepository(Category)
    }

    async create(post: IPost): Promise<IPost> {
        const newPost = this.repository.create(post)
        const categoryIds = (post.categories ?? [])
            .map((category) => category.id)
            .filter((id): id is number => id !== undefined && id !== null)

        if (categoryIds.length > 0) {
            newPost.categories = await this.categoryRepository.findBy({
                id: In(categoryIds),
            })
        }

        return await this.repository.save(newPost)
    }

    async findAll(): Promise<IPost[]> {
        return await this.repository.find({
            relations: { user: true, categories: true },
            order: { created_at: 'DESC' },
        })
    }

    async findById(id: number): Promise<IPost | null> {
        return await this.repository.findOne({
            where: { id },
            relations: { user: true, categories: true },
        })
    }

    async search(keyword: string): Promise<IPost[]> {
        return await this.repository.find({
            where: [
                { title: ILike(`%${keyword}%`) },
                { content: ILike(`%${keyword}%`) },
            ],
            relations: { user: true, categories: true },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, post: Partial<IPost>): Promise<IPost | null> {
        const existingPost = await this.repository.findOne({
            where: { id },
            relations: { user: true, categories: true },
        })

        if (!existingPost) {
            return null
        }

        const { categories, ...fields } = post

        const updatedPost = this.repository.merge(existingPost, {
            ...fields,
            updated_at: new Date(),
        })

        // `categories` fica fora do merge: o corpo manda `[{ id }]` e passar isso adiante
        // gravaria entidades pela metade. As relacoes acima precisam vir carregadas, senao
        // o save mexe na tabela de juncao sozinho.
        if (categories) {
            const categoryIds = categories
                .map((category) => category.id)
                .filter((categoryId): categoryId is number => categoryId !== undefined && categoryId !== null)

            updatedPost.categories = categoryIds.length > 0
                ? await this.categoryRepository.findBy({ id: In(categoryIds) })
                : []
        }

        return await this.repository.save(updatedPost)
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete({ id })
        return !!result.affected && result.affected > 0
    }
}