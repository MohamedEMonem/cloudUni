FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL (Required by Prisma during build)
RUN apk add --no-cache openssl

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


FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Redefine the ARG and ENV in the runner stage so it exists at runtime
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# ✅ FIX 1: Install OpenSSL (Required by Prisma in production)
RUN apk add --no-cache openssl

# Keep `package.json` so Node treats output as ESM (`"type": "module"`)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ✅ FIX 2: Copy Prisma schema so your prostartup.sh migrations can run
COPY --from=builder /app/prisma ./prisma

# Runtime files loaded from disk
COPY --from=builder /app/swagger-output.json ./swagger-output.json
COPY --from=builder /app/src/templates ./src/templates

# Copy the start script
COPY docker/prostartup.sh ./

# Make the script executable
RUN chmod +x prostartup.sh

# Expose the port
EXPOSE 3000

# Run the script when the container starts
CMD ["./prostartup.sh"]