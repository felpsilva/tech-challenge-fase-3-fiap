# Imagem do backend (API Fastify + TypeORM).
# As variaveis de ambiente sao injetadas em runtime pelo ambiente de deploy.
FROM node:20-alpine

WORKDIR /app

COPY blog-educacional/backend/package*.json ./
RUN npm ci

COPY blog-educacional/backend/ ./

EXPOSE 3001

CMD ["npm", "start"]
