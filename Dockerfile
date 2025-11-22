# Etapa 1: Build del frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto de archivos del proyecto
COPY . .

# Build del frontend
RUN pnpm build

# Etapa 2: Servidor de producción
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar servidor
COPY server ./server

# Copiar el build del frontend desde la etapa anterior
COPY --from=frontend-builder /app/dist ./dist

# Copiar las fuentes
COPY fonts ./public/fonts

# Crear directorio para grabaciones
RUN mkdir -p /app/server/recordings

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Comando para iniciar el servidor
CMD ["node", "server/index.js"]

