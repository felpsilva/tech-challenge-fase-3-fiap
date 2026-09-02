import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { config } from 'dotenv'

/**
 * O `.env` do projeto vive na RAIZ do repositorio, nao dentro deste pacote:
 * backend e frontend compartilham a mesma configuracao. O `import
 * 'dotenv/config'` que existia antes so olhava para o cwd e nao acharia nada
 * depois da mudanca.
 *
 * A busca sobe a arvore a partir do cwd ate o diretorio que contem `.git`
 * (inclusive) ou ate a raiz do sistema de arquivos. O limite no `.git` importa:
 * sem ele, um `.env` esquecido no home do usuario entraria na configuracao.
 *
 * Na imagem Docker nao existe `.git` nem `.env` — a configuracao chega pelo
 * `env_file`/`environment` do compose, e a lista volta vazia sem quebrar.
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

        if (existsSync(resolve(dir, '.git')) || parent === dir) {
            break
        }

        dir = parent
    }

    return found
}

/**
 * Carrega os arquivos encontrados, do mais proximo para o mais distante.
 * Variavel ja presente em `process.env` (compose, CI, painel do Render) sempre
 * vence — e o comportamento padrao do dotenv, e o que permite sobrescrever a
 * configuracao versionada sem editar arquivo.
 */
export function loadEnvFiles(
    startDir: string = process.cwd(),
    nodeEnv: string | undefined = process.env.NODE_ENV,
): string[] {
    const files = resolveEnvFiles(startDir, nodeEnv)

    for (const path of files) {
        config({ path, quiet: true })
    }

    return files
}
