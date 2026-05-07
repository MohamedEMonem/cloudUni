FROM node:22-slim
# Set to production to optimize NPM and Node behavior
ENV NODE_ENV=production

WORKDIR /app
# Copy package files and install dependencies
COPY ./package*.json ./
# npm ci is great, but we only need production dependencies for the final image
RUN npm ci --omit=dev

# Copy Prisma schema and generate the client
COPY ./prisma ./prisma/
# Generate the Prisma client (this needs to happen at build time)
RUN npx prisma generate

# Copy the rest of your application code
COPY . .

# Change ownership of the /app folder to the restricted 'node' user
RUN chown -R node:node /app

# Switch to the restricted 'node' user for security
USER node

EXPOSE 3000

# Use a startup script to handle migrations, OR just start the app if 
# migrations are handled externally.
CMD ["npm", "start"]