import { env } from '@/env'
import { app } from '@/app'
import { databaseReady } from '@/lib/typeorm/typeorm'

async function start() {
    // A porta so abre depois do DataSource pronto: sem esta espera, a requisicao que
    // cair na janela falha com EntityMetadataNotFoundError.
    await databaseReady

    await app.listen({
        host: '0.0.0.0',
        port: env.PORT,
    })

    console.log(`O servidor está rodando em http://localhost:${env.PORT}`)
}

start().catch((err) => {
    console.error('Falha ao subir o servidor', err)
    process.exit(1)
})
