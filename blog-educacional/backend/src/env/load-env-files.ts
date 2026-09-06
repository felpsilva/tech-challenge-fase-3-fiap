import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { config } from 'dotenv'

// O `.env` do projeto vive na RAIZ do repositorio, compartilhado com o frontend. A
// busca sobe ate o diretorio com `.git` para um `.env` do home nao entrar na config.
export function resolveEnvFiles(startDir: string, nodeEnv?: string): string[] {
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
