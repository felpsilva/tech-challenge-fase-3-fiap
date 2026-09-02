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

/**
 * A promise da inicializacao e exportada de proposito: o `server.ts` espera
 * por ela antes de abrir a porta.
 *
 * Enquanto isto era so efeito colateral de import, o Fastify comecava a
 * aceitar requisicao antes das entidades estarem registradas, e toda chamada
 * que caisse nessa janela — a primeira apos cada deploy, tipicamente —
 * falhava com `EntityMetadataNotFoundError`.
 */
export const databaseReady = appDataSource.initialize()
    .then((dataSource) => {
        console.log('Base de dados com typeorm inicializada com sucesso!')
        return dataSource
    })

// Quem decide o que fazer com a falha e o `server.ts`, que espera por
// `databaseReady`. Este handler existe so para o caso de ninguem esperar —
// em ambiente sem banco alcancavel, a rejeicao solta derrubaria o processo
// como unhandled rejection antes de alguem poder tratar o erro.
databaseReady.catch((err) => {
    console.error('Erro ao inicializar a base de dados com typeorm', err)
})