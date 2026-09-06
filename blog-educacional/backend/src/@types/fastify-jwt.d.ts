import '@fastify/jwt'

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
