# Stage 1: Build the React Client
FROM node:18-alpine AS client-builder
WORKDIR /app-client
COPY package*.json ./
RUN npm ci
COPY . .
# Build the client to /app-client/dist
RUN npm run build

# Stage 2: Build the Node.js Server
FROM node:18-alpine AS server-builder
WORKDIR /app-server
COPY server/package*.json ./
RUN apk add --no-cache openssl
RUN npm ci
COPY server/ .
# Build the server to /app-server/dist
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy server dependencies
COPY --from=server-builder /app-server/package*.json ./
COPY --from=server-builder /app-server/node_modules ./node_modules
# Copy server build artifacts
COPY --from=server-builder /app-server/dist ./dist
# Copy Prisma schema and migrations
COPY --from=server-builder /app-server/prisma ./prisma
# Copy client build artifacts to 'public' folder served by Express
COPY --from=client-builder /app-client/dist ./public

# Environment variables
ENV NODE_ENV=production



# Start the server directly (bypassing npm to avoid script caching issues)
CMD ["npm", "start"]
