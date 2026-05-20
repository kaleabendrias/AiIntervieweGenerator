FROM node:20-alpine AS deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/backend/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
