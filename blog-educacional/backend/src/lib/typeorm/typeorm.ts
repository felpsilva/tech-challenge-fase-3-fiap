import { DataSource } from 'typeorm'
import { env } from '@/env'
import { User } from '@/entities/user.entity'
import { Post } from '@/entities/post.entity'
import { Category } from '@/entities/category.entity'
import { PostImage } from '@/entities/post-image.entity'

const isNeonDatabase = env.DATABASE_URL?.includes('neon.tech')

export const appDataSource = new DataSource({
    type: 'postgres',
    ...(env.DATABASE_URL
        ? { url: env.DATABASE_URL }
        : {
            host: env.DB_HOST,
            port: env.DB_PORT,
            username: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
        }),
    ...(isNeonDatabase ? { ssl: { rejectUnauthorized: false } } : {}),
    entities: [User, Post, Category, PostImage],
    logging: env.NODE_ENV === 'development',
})

appDataSource.initialize()
    .then(() => {
        console.log('Base de dados com typeorm inicializada com sucesso!')
    })
    .catch((err) => {
        console.error('Erro ao inicializar a base de dados com typeorm', err)
    })