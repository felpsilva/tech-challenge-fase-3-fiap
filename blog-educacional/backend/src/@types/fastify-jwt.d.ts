import '@fastify/jwt'

/**
 * Claims assinadas no signin. O `id` e o motivo desta declaracao existir: o
 * `POST /post` exige `user_id` no corpo e o `GET /user` e restrito a admin,
 * entao sem o id no token um professor nao teria como descobrir o proprio.
 */
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            id: number
            username: string
            permission: string
        }
        user: {
            id: number
            username: string
            permission: string
            iat: number
            exp: number
        }
    }
}
