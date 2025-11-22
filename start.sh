#!/bin/bash

echo "🚀 Iniciando Audio Recorder..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

# Verificar si hay un build del frontend
if [ ! -d "dist" ]; then
    echo "📦 No se encontró el build del frontend. Construyendo..."
    
    if ! command -v pnpm &> /dev/null; then
        echo "⚠️  pnpm no está instalado. Instalando dependencias con npm..."
        npm install
        npm run build
    else
        echo "📦 Instalando dependencias con pnpm..."
        pnpm install
        echo "🔨 Construyendo frontend..."
        pnpm build
    fi
fi

# Crear directorio de grabaciones si no existe
mkdir -p server/recordings

# Levantar contenedores
echo "🐳 Levantando contenedores Docker..."
docker-compose up -d

echo ""
echo "✅ ¡Listo! La aplicación está corriendo."
echo ""
echo "🌐 Accede a: http://localhost"
echo "📡 API: http://localhost/api/health"
echo ""
echo "📋 Comandos útiles:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Detener: docker-compose down"
echo "  - Reiniciar: docker-compose restart"
echo ""

