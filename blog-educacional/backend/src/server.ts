import { env } from '@/env'
import { app } from '@/app'
import { databaseReady } from '@/lib/typeorm/typeorm'

async function start() {
    // A porta so abre depois do DataSource pronto. Sem esta espera o Fastify
    // aceita requisicao com as entidades ainda nao registradas, e a chamada
    // que cair nessa janela falha com `EntityMetadataNotFoundError`.
    await databaseReady

    await app.listen({
        host: '0.0.0.0',
        port: env.PORT,
    })

    console.log(`O servidor está rodando em http://localhost:${env.PORT}`)
}

// Falhar alto: um processo vivo com banco inacessivel responderia erro em
// toda rota, e no Render pareceria um deploy bem-sucedido.
start().catch((err) => {
    console.error('Falha ao subir o servidor', err)
    process.exit(1)
})
