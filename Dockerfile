############################################
# Stage 1: Build React app with Node
############################################
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json* yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci; fi

# Copy source and build
COPY . .
RUN npm run build

############################################
# Stage 2: Serve static files with Nginx
############################################
FROM nginx:alpine

# Clean default config and copy custom one
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output (Vite → dist, CRA → build)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ | grep -qi "<!doctype html>" || exit 1

CMD ["nginx", "-g", "daemon off;"]
