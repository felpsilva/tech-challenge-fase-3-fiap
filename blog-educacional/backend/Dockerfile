# Imagem do backend (API Fastify + TypeORM).
# Construida a partir da RAIZ do repositorio: e o unico jeito de o `.env`
# compartilhado entrar na imagem. Com o contexto em `./backend` o container
# sobe sem DB_HOST/JWT_SECRET e morre na validacao do env.
FROM node:20-alpine

WORKDIR /app

COPY blog-educacional/backend/package*.json ./
RUN npm ci

COPY blog-educacional/backend/ ./

COPY .env* ./

EXPOSE 3001

CMD ["npm", "start"]
