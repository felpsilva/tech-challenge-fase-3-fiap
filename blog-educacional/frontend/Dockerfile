# Imagem do frontend (Next.js 16, App Router).
#
# Diferente do backend — que roda TypeScript direto via tsx, sem etapa de
# build — aqui existe compilacao, entao a imagem e multi-stage e usa a saida
# `standalone` do Next para nao carregar o node_modules inteiro em producao.

# --- Estagio 1: dependencias ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

# --- Estagio 2: build ---
FROM node:22-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* e embutido no bundle do navegador durante o BUILD: precisa
# chegar como ARG. Passar como variavel de runtime nao tem efeito nenhum.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Estagio 3: runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Obrigatorio: o servidor standalone escuta em localhost por padrao, e o
# mapeamento de porta pareceria quebrado sem isto.
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `public/` e `.next/static` NAO entram na saida standalone: vao a mao.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
