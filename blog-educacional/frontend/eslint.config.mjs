import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// O `next lint` foi removido no Next 16 e o eslint-config-next passou a ser
// distribuido em flat config nativo — nada de FlatCompat aqui.
const config = [
    {
        ignores: ['**/.next/**', '**/node_modules/**', '**/coverage/**', '**/next-env.d.ts'],
    },
    ...coreWebVitals,
    ...nextTypescript,
    {
        // Sem a versao explicita, o eslint-plugin-react tenta detecta-la com
        // uma API que o ESLint 10 nao tem mais e o lint quebra por inteiro.
        settings: {
            react: { version: '19.2' },
        },
    },
    {
        // Restrito a TS/TSX: a regra vem do plugin do typescript-eslint, que
        // nao esta carregado para .mjs/.cjs.
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
        },
    },
    {
        // Config em CommonJS: o `next/jest` so e exposto por require, e o Jest
        // carrega o arquivo como CJS.
        files: ['**/*.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
]

export default config
