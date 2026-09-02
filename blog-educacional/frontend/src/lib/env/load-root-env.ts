import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { config } from 'dotenv'

/**
 * O Next so carrega arquivos `.env` do diretorio do proprio pacote. Como a
 * configuracao do projeto passou a viver na RAIZ do repositorio — compartilhada
 * com o backend —, ela precisa ser trazida a mao, e isso acontece no topo do
 * `next.config.ts`.
 *
 * Momento importa: `NEXT_PUBLIC_*` e inlinado no bundle durante o BUILD. O
 * `next.config.ts` e avaliado antes da compilacao, no mesmo processo, entao o
 * valor lido aqui e o que vai para o navegador. Carregar isto em qualquer
 * modulo da aplicacao seria tarde demais.
 *
 * A saida `standalone` NAO carrega o `next.config.ts` em runtime: no Docker o
 * `API_URL` continua vindo do `environment` do compose, nao daqui.
 */
export function resolveEnvFiles(startDir: string, nodeEnv?: string): string[] {
    // `.env.<NODE_ENV>` antes de `.env`: o dotenv nao sobrescreve o que ja foi
    // definido, entao quem e carregado primeiro vence.
    const fileNames = nodeEnv ? [`.env.${nodeEnv}`, '.env'] : ['.env']
    const found: string[] = []

    let dir = resolve(startDir)

    for (;;) {
        for (const fileName of fileNames) {
            const candidate = resolve(dir, fileName)

            if (existsSync(candidate)) {
                found.push(candidate)
            }
        }

        const parent = dirname(dir)

        // Para no repositorio: sem este limite, um `.env` esquecido no home do
        // usuario entraria na configuracao do build.
        if (existsSync(resolve(dir, '.git')) || parent === dir) {
            break
        }

        dir = parent
    }

    return found
}

/**
 * Variavel ja presente em `process.env` (build-arg do Docker, `env` do
 * workflow, painel do host) sempre vence o arquivo.
 */
export function loadRootEnv(
    startDir: string = process.cwd(),
    nodeEnv: string | undefined = process.env.NODE_ENV,
): string[] {
    const files = resolveEnvFiles(startDir, nodeEnv)

    for (const path of files) {
        config({ path, quiet: true })
    }

    return files
}
