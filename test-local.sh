#!/bin/bash

echo "🧪 Probando la aplicación Audio Recorder..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar dependencias
echo "📦 Verificando dependencias..."

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado. Instalando dependencias...${NC}"
    pnpm install
fi

if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  dist no encontrado. Construyendo frontend...${NC}"
    pnpm build
fi

echo -e "${GREEN}✅ Dependencias OK${NC}"
echo ""

# Iniciar servidor
echo "🚀 Iniciando servidor en puerto 3001..."
echo ""
echo "📝 Nota: El servidor servirá tanto el frontend como el backend"
echo "   Frontend: http://localhost:3001"
echo "   API: http://localhost:3001/api/health"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

NODE_ENV=production PORT=3001 node server/index.js

