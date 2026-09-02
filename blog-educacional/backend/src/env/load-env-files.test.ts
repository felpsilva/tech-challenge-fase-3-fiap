import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { loadEnvFiles, resolveEnvFiles } from './load-env-files'

/**
 * Monta um repositorio de mentira com a mesma forma do real:
 *
 *   <raiz>/.git
 *   <raiz>/.env
 *   <raiz>/blog-educacional/backend/   <- cwd do backend
 */
function createFakeRepo() {
    const root = mkdtempSync(resolve(tmpdir(), 'env-files-'))
    const packageDir = resolve(root, 'blog-educacional', 'backend')

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

    it('acha o .env da raiz a partir do diretorio do backend', () => {
        writeFileSync(resolve(repo.root, '.env'), 'DB_HOST=raiz\n')

        expect(resolveEnvFiles(repo.packageDir)).toEqual([resolve(repo.root, '.env')])
    })

    it('coloca o .env.<NODE_ENV> antes do .env, para ele ter precedencia', () => {
        writeFileSync(resolve(repo.root, '.env'), 'API_URL=dev\n')
        writeFileSync(resolve(repo.root, '.env.production'), 'API_URL=prod\n')

        expect(resolveEnvFiles(repo.packageDir, 'production')).toEqual([
            resolve(repo.root, '.env.production'),
            resolve(repo.root, '.env'),
        ])
    })

    it('lista o arquivo mais proximo antes do da raiz', () => {
        writeFileSync(resolve(repo.root, '.env'), 'DB_HOST=raiz\n')
        writeFileSync(resolve(repo.packageDir, '.env'), 'DB_HOST=local\n')

        expect(resolveEnvFiles(repo.packageDir)).toEqual([
            resolve(repo.packageDir, '.env'),
            resolve(repo.root, '.env'),
        ])
    })

    it('para no diretorio com .git e nao le o .env de fora do repositorio', () => {
        // Um `.env` acima da raiz do repositorio — o home do usuario, na
        // pratica. Nao pode entrar na configuracao do projeto.
        writeFileSync(resolve(repo.root, '..', '.env'), 'DB_HOST=vazado\n')
        writeFileSync(resolve(repo.root, '.env'), 'DB_HOST=raiz\n')

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

describe('loadEnvFiles', () => {
    let repo: ReturnType<typeof createFakeRepo>

    beforeEach(() => {
        repo = createFakeRepo()
    })

    afterEach(() => {
        rmSync(repo.root, { recursive: true, force: true })
        delete process.env.ENV_FILES_TEST_VALUE
        delete process.env.ENV_FILES_TEST_PRESET
    })

    it('exporta o valor do .env da raiz para o process.env', () => {
        writeFileSync(resolve(repo.root, '.env'), 'ENV_FILES_TEST_VALUE=da-raiz\n')

        loadEnvFiles(repo.packageDir)

        expect(process.env.ENV_FILES_TEST_VALUE).toBe('da-raiz')
    })

    it('deixa o .env.<NODE_ENV> vencer o .env', () => {
        writeFileSync(resolve(repo.root, '.env'), 'ENV_FILES_TEST_VALUE=dev\n')
        writeFileSync(resolve(repo.root, '.env.production'), 'ENV_FILES_TEST_VALUE=prod\n')

        loadEnvFiles(repo.packageDir, 'production')

        expect(process.env.ENV_FILES_TEST_VALUE).toBe('prod')
    })

    it('nao sobrescreve variavel ja definida no ambiente', () => {
        // E o que permite ao compose, ao CI e ao painel do Render mandarem
        // mais alto que o arquivo versionado.
        process.env.ENV_FILES_TEST_PRESET = 'do-ambiente'
        writeFileSync(resolve(repo.root, '.env'), 'ENV_FILES_TEST_PRESET=do-arquivo\n')

        loadEnvFiles(repo.packageDir)

        expect(process.env.ENV_FILES_TEST_PRESET).toBe('do-ambiente')
    })
})
