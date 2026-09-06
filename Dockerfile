###############################################
# Multi-stage Docker build for Prayer Times App
###############################################

# Stage 1: Build stage
FROM node:26-alpine AS builder

WORKDIR /app

# Install dependencies with optimizations
COPY package*.json ./
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy source code
COPY . .

# Build application
RUN npm run build && \
    npm prune --production

# Stage 2: Runtime stage (minimal distroless image)
FROM node:26-alpine AS distroless-prep

WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN mkdir -p /home/appuser && chown -R 1001:1001 /home/appuser /app

# Production image - distroless (no OS, no vulnerabilities)
FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

# Copy built app only
COPY --from=distroless-prep --chown=65532:65532 /app/dist ./dist

# Health check (distroless doesn't support CMD health check, use external monitoring)
EXPOSE 3000

# Use node directly to serve dist folder with simple HTTP server
ENTRYPOINT ["/nodejs/bin/node", "-e", "const http = require('http'); const fs = require('fs'); const path = require('path'); const root = '/app/dist'; const srv = http.createServer((req, res) => { const file = path.join(root, req.url === '/' ? 'index.html' : req.url); fs.stat(file, (e, s) => { if (e || !s.isFile()) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); fs.createReadStream(file).pipe(res); } }); }); srv.listen(3000);"]
