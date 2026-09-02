/**
 * @jest-environment node
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { loadRootEnv, resolveEnvFiles } from './load-root-env'

/**
 * Repositorio de mentira com a mesma forma do real:
 *
 *   <raiz>/.git
 *   <raiz>/.env
 *   <raiz>/blog-educacional/frontend/   <- cwd do frontend
 */
function createFakeRepo() {
    const root = mkdtempSync(resolve(tmpdir(), 'root-env-'))
    const packageDir = resolve(root, 'blog-educacional', 'frontend')

    mkdirSync(packageDir, { recursive: true })
    mkdirSync(resolve(root, '.git'))

    return { root, packageDir }
}

describe('resolveEnvFiles', () => {
    let repo: ReturnType<typeof createFakeRepo>

    beforeEach(() => {
        repo = createFakeRepo()
    })

    afterEach(() => {
        rmSync(repo.root, { recursive: true, force: true })
    })

    it('acha o .env da raiz a partir do diretorio do frontend', () => {
        writeFileSync(resolve(repo.root, '.env'), 'NEXT_PUBLIC_API_URL=http://localhost:3001\n')

        expect(resolveEnvFiles(repo.packageDir)).toEqual([resolve(repo.root, '.env')])
    })

    it('coloca o .env.production antes do .env, para ele ter precedencia', () => {
        writeFileSync(resolve(repo.root, '.env'), 'NEXT_PUBLIC_API_URL=http://localhost:3001\n')
        writeFileSync(resolve(repo.root, '.env.production'), 'NEXT_PUBLIC_API_URL=https://api\n')

        expect(resolveEnvFiles(repo.packageDir, 'production')).toEqual([
            resolve(repo.root, '.env.production'),
            resolve(repo.root, '.env'),
        ])
    })

    it('para no diretorio com .git e nao le o .env de fora do repositorio', () => {
        writeFileSync(resolve(repo.root, '..', '.env'), 'NEXT_PUBLIC_API_URL=http://vazado\n')
        writeFileSync(resolve(repo.root, '.env'), 'NEXT_PUBLIC_API_URL=http://localhost:3001\n')

        try {
            expect(resolveEnvFiles(repo.packageDir)).toEqual([resolve(repo.root, '.env')])
        } finally {
            rmSync(resolve(repo.root, '..', '.env'), { force: true })
        }
    })

    it('devolve lista vazia quando nao ha .env — o caso da imagem Docker', () => {
        expect(resolveEnvFiles(repo.packageDir)).toEqual([])
    })
})

describe('loadRootEnv', () => {
    let repo: ReturnType<typeof createFakeRepo>

    beforeEach(() => {
        repo = createFakeRepo()
    })

    afterEach(() => {
        rmSync(repo.root, { recursive: true, force: true })
        delete process.env.ROOT_ENV_TEST_VALUE
        delete process.env.ROOT_ENV_TEST_PRESET
    })

    it('exporta o valor do .env da raiz para o process.env', () => {
        writeFileSync(resolve(repo.root, '.env'), 'ROOT_ENV_TEST_VALUE=da-raiz\n')

        loadRootEnv(repo.packageDir)

        expect(process.env.ROOT_ENV_TEST_VALUE).toBe('da-raiz')
    })

    it('em producao usa a URL do .env.production', () => {
        writeFileSync(resolve(repo.root, '.env'), 'ROOT_ENV_TEST_VALUE=http://localhost:3001\n')
        writeFileSync(
            resolve(repo.root, '.env.production'),
            'ROOT_ENV_TEST_VALUE=https://blog-educacional-backend-1.onrender.com\n',
        )

        loadRootEnv(repo.packageDir, 'production')

        expect(process.env.ROOT_ENV_TEST_VALUE).toBe(
            'https://blog-educacional-backend-1.onrender.com',
        )
    })

    it('nao sobrescreve variavel ja definida no ambiente', () => {
        // E o que faz o build-arg do Docker e o `env` do workflow mandarem
        // mais alto que o arquivo versionado.
        process.env.ROOT_ENV_TEST_PRESET = 'do-ambiente'
        writeFileSync(resolve(repo.root, '.env'), 'ROOT_ENV_TEST_PRESET=do-arquivo\n')

        loadRootEnv(repo.packageDir)

        expect(process.env.ROOT_ENV_TEST_PRESET).toBe('do-ambiente')
    })
})
