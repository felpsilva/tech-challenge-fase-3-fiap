# Imagem do backend (API Fastify + TypeORM).
# Roda o TypeScript diretamente via tsx (sem etapa de build).
#
# ATENCAO ao contexto: este Dockerfile e construido a partir da RAIZ do
# repositorio, nao da pasta do backend. E o unico jeito de o `.env`
# compartilhado da raiz entrar na imagem — com o contexto em `./backend` ele
# fica um nivel acima, e o container sobe sem DB_HOST/JWT_SECRET e morre na
# validacao do env. Veja `docker-compose.yml` e o workflow de CI.
FROM node:20-alpine

WORKDIR /app

# Instala as dependências primeiro para aproveitar o cache de camadas.
COPY blog-educacional/backend/package*.json ./
RUN npm ci

# Copia o restante do código-fonte.
COPY blog-educacional/backend/ ./

# Configuração compartilhada da raiz. É fallback, não trava: variável definida
# no painel do host (Render) continua vencendo o arquivo.
COPY .env* ./

EXPOSE 3001

CMD ["npm", "start"]
