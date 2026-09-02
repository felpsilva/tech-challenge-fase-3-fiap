const nextJest = require('next/jest')

// `next/jest` aplica as mesmas transformacoes SWC do build — inclusive a do
// styled-components configurada no next.config.ts. Com um transformer
// generico, o nome das classes divergiria do que roda em producao.
const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
    testEnvironment: 'jsdom',
    // Sem isto o Jest varre o build standalone e reclama de colisao de nome
    // entre o package.json da raiz e o copiado para dentro de .next.
    modulePathIgnorePatterns: ['<rootDir>/.next/'],
    clearMocks: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
})
