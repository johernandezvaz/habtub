# ── Python dependencies ──────────────────────────────────────────────────────
FROM python:3.13-slim AS python-builder

WORKDIR /build
RUN pip install --upgrade pip
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
COPY backend/ ./backend/

# ── Frontend build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /build
RUN npm install -g pnpm
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY

RUN PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
    PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY \
    pnpm --filter frontend build

# Genera un directorio de deploy auto-contenido (sin symlinks al virtual store)
RUN pnpm --filter frontend deploy --prod --legacy /deploy/frontend
# Copia el output de Vite al directorio de deploy
RUN cp -r /build/frontend/build /deploy/frontend/build

# ── Imagen final ──────────────────────────────────────────────────────────────
# Usamos python:3.13-slim como base para que los paquetes pip coincidan
# con la version de Python 3.13 instalada en el builder.
FROM python:3.13-slim

# Instalar Node.js 22 y utilidades necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    bash \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 1001 appgroup && \
    adduser --disabled-password --uid 1001 --ingroup appgroup appuser

WORKDIR /app

# Paquetes Python (instalados con --prefix=/install -> van a /usr/local de Python 3.13)
COPY --from=python-builder --chown=appuser:appgroup /install /usr/local
COPY --from=python-builder --chown=appuser:appgroup /build/backend /app/backend

# Frontend auto-contenido (build + node_modules reales, sin symlinks)
COPY --from=frontend-builder --chown=appuser:appgroup /deploy/frontend /app/frontend

COPY --chown=appuser:appgroup start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["/app/start.sh"]