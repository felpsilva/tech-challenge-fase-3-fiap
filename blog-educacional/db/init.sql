-- Schema inicial do Blog Educacional.
-- Executado automaticamente pelo Postgres na primeira subida do container

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    permission  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    title       VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    image_url   VARCHAR(255),
    status      VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Thumbnail do post armazenada como arquivo binário.
-- Fica em tabela separada (1:1) de propósito: assim os SELECTs de `posts`
-- nunca carregam o binário, e o custo de egress do Neon não explode nas
-- listagens. A PK é o próprio post_id, o que garante uma imagem por post.
CREATE TABLE IF NOT EXISTS post_images (
    post_id     INTEGER PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,
    mime_type   VARCHAR(100) NOT NULL,
    size_bytes  INTEGER NOT NULL,
    data        BYTEA NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de junção da relação ManyToMany entre posts e categorias.
CREATE TABLE IF NOT EXISTS post_categories (
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Dados de demonstração (seed)
-- ---------------------------------------------------------------------------
INSERT INTO users (username, password, permission)
VALUES ('admin', '$2b$08$XEcmG48tmCloviGyjJKyuuTxjpefeJVBYr1K5kiyCBUrGl2Y7LYtC', 'admin')
ON CONFLICT (username) DO NOTHING;