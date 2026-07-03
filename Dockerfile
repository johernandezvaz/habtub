FROM python:3.13-slim AS python-builder

WORKDIR /build
RUN pip install --upgrade pip
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
COPY backend/ ./backend/

FROM node:22-alpine AS frontend-builder

WORKDIR /build
RUN npm install -g pnpm
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/

RUN pnpm --filter frontend build

FROM node:22-alpine

RUN apk add --no-cache \
    bash \
    curl \
    ca-certificates \
    python3 \
    py3-pip

RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

COPY --from=python-builder --chown=appuser:appgroup /install /usr/local
COPY --from=python-builder --chown=appuser:appgroup /build/backend /app/backend

COPY --from=frontend-builder --chown=appuser:appgroup /build/frontend/build /app/frontend/build
COPY --from=frontend-builder --chown=appuser:appgroup /build/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder --chown=appuser:appgroup /build/frontend/node_modules /app/frontend/node_modules

COPY --chown=appuser:appgroup start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER appuser    

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["/app/start.sh"]