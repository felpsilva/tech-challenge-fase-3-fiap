import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
    {
        ignores: ['**/.next/**', '**/node_modules/**', '**/coverage/**', '**/next-env.d.ts'],
    },
    ...coreWebVitals,
    ...nextTypescript,
    {
        settings: {
            react: { version: '19.2' },
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
        },
    },
    {
        files: ['**/*.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
]

export default config
