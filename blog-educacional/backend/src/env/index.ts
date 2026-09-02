import { z } from 'zod';

import { loadEnvFiles } from './load-env-files';

// Precisa rodar antes do parse: e o que traz o `.env` da raiz para o
// `process.env`.
loadEnvFiles();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'teste']).default('development'),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().url().optional(),
    DB_HOST: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_PORT: z.coerce.number(),
    DB_NAME: z.string(),
    JWT_SECRET: z.string(),
    // Origem liberada no CORS. Aceita uma lista separada por virgula para
    // cobrir dev e o dominio publicado ao mesmo tempo.
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    console.error('Variáveis de ambientes inválidas', _env.error.format());
    throw new Error('Variáveis de ambientes inválidas');
}

export const env = _env.data;