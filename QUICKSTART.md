# 🚀 Quick Start Guide

Guía rápida para poner en marcha el proyecto Audio Recorder.

## ⚡ Opción 1: Con Docker (Más Fácil)

Si tienes Docker instalado:

```bash
# 1. Construir el proyecto
pnpm install
pnpm build

# 2. Levantar con Docker
docker-compose up -d

# 3. Acceder a la aplicación
# Abre tu navegador en: http://localhost
```

**¡Eso es todo!** 🎉

### Comandos útiles con Docker:

```bash
# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart
```

## 🛠️ Opción 2: Desarrollo Local (Sin Docker)

Para desarrollo activo:

```bash
# 1. Instalar dependencias
pnpm install

# 2. Terminal 1: Frontend (Vite)
pnpm dev

# 3. Terminal 2: Backend (Express)
pnpm server
```

Accede a: http://localhost:5173

## 📦 Opción 3: Producción Local (Sin Docker)

Si quieres probar en modo producción sin Docker:

```bash
# 1. Instalar y construir
pnpm install
pnpm build

# 2. Iniciar servidor
pnpm start

# O usar el script de prueba
./test-local.sh
```

Accede a: http://localhost:3001

## 🎮 Uso de la Aplicación

1. **Permitir acceso al micrófono** cuando el navegador lo solicite
2. **Mantén presionado el botón circular** para grabar
3. **Suelta el botón** para detener la grabación
4. Las grabaciones aparecerán en la lista debajo del botón

### Características:
- ⏱️ Máximo 60 segundos por grabación
- 🎨 Progreso visual circular (estilo Instagram)
- 🔴 Indicador de grabación en tiempo real
- 📝 Lista de todas tus grabaciones
- ▶️ Reproductor de audio integrado

## 🔧 Usando Make (Opcional)

Si prefieres usar `make`:

```bash
# Ver todos los comandos
make help

# Comandos más útiles:
make install        # Instalar dependencias
make build          # Construir frontend
make start          # Iniciar en producción
make docker-up      # Levantar con Docker
make docker-logs    # Ver logs
```

## 🌐 Despliegue en VPS

Para desplegar en un servidor:

```bash
# En el servidor
git clone <tu-repo> audio-recorder
cd audio-recorder
pnpm install
pnpm build
docker-compose up -d
```

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para guía completa de despliegue.

## ❓ Troubleshooting

### El micrófono no funciona
- ✅ Verifica permisos en el navegador
- ✅ Solo funciona en HTTPS o localhost
- ✅ Prueba con otro navegador

### Puerto 80 ocupado
```bash
# Cambiar puerto en docker-compose.yml:
ports:
  - "8080:3001"  # En lugar de "80:3001"
```

### Error al instalar dependencias
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Docker no inicia
```bash
# Ver logs detallados
docker-compose logs -f app

# Reconstruir
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Más Información

- [README.md](README.md) - Información general
- [README.proyecto.md](README.proyecto.md) - Documentación técnica completa
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía de despliegue en VPS

## 💡 Tips

1. **Para desarrollo**: Usa `pnpm dev` + `pnpm server` (cambios en vivo)
2. **Para producción local**: Usa `pnpm start` (más rápido)
3. **Para VPS**: Usa Docker Compose (más fácil de mantener)

## 🎯 Estructura Mínima Necesaria

```
boton/
├── src/              # Código fuente React
├── server/           # Backend Express
├── public/fonts/     # Fuentes
├── package.json      # Dependencias
├── vite.config.js    # Config Vite
├── docker-compose.yml # Config Docker
└── Dockerfile        # Imagen Docker
```

¡Listo para empezar! 🚀

