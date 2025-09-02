############################################
# Build stage: install deps and build static
############################################
FROM node:20-alpine AS builder
WORKDIR /app

# Only copy files needed to install deps first (better caching)
COPY package.json package-lock.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci; fi

# Copy source and build
COPY . .
RUN npm run build

############################################
# Runtime stage: Nginx serves built assets
############################################
FROM nginx:alpine

# Replace default server config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ | grep -qi "<!doctype html>" || exit 1

CMD ["nginx", "-g", "daemon off;"]
