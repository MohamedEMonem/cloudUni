FROM node:22-slim AS builder

WORKDIR /app

# Install all deps (incl. dev) so we can run Prisma CLI + TypeScript build
COPY package*.json ./
RUN npm ci

# Prisma client generation
COPY prisma ./prisma
COPY prisma.config.js ./

# Prisma config in this repo reads DATABASE_URL. Provide a harmless default so
# `prisma generate` doesn't fail during docker build.
ARG DATABASE_URL="postgres://root:root@localhost:5432/my_app_db"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# Build the app
COPY tsconfig.json ./
COPY swagger-output.json ./
COPY src ./src
RUN npm run build

# Keep runtime image slim (remove dev dependencies)
RUN npm prune --omit=dev


FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Keep `package.json` so Node treats output as ESM (`"type": "module"`)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Runtime files loaded from disk
COPY --from=builder /app/swagger-output.json ./swagger-output.json
COPY --from=builder /app/src/templates ./src/templates
EXPOSE 3000

CMD ["npm", "start"]