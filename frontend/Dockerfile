FROM node:20-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app/frontend
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
