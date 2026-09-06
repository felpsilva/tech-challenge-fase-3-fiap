import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { IUserRepository } from '../user.repository.interface';
import { appDataSource } from '@/lib/typeorm/typeorm';
import { IUser } from '@/entities/models/user.interface';

export class UserRepository implements IUserRepository {
    private repository: Repository<User>

    constructor() {
        this.repository = appDataSource.getRepository(User)
    }

    async create(user: IUser): Promise<IUser | undefined> {
        return await this.repository.save(user)
    }

    async findAll(): Promise<IUser[]> {
        return await this.repository.find({
            order: { created_at: 'DESC' },
        })
    }

    async findById(id: number): Promise<IUser | null> {
        return await this.repository.findOne({ where: { id } })
    }

    // Unico ponto que traz o hash da senha: o signin precisa dele para o bcrypt.
    async findByUsername(username: string): Promise<IUser | null> {
        return await this.repository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username })
            .getOne()
    }

    async update(id: number, user: Partial<IUser>): Promise<IUser | null> {
        const existingUser = await this.repository.findOne({ where: { id } })

        if (!existingUser) {
            return null
        }

        const updatedUser = this.repository.merge(existingUser, user)

        return await this.repository.save(updatedUser)
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete({ id })
        return !!result.affected && result.affected > 0
    }
}