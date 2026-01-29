# Build stage
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:lts-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/production-server.mjs ./

USER node

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "production-server.mjs"]
