# 📦 Guía de Instalación

## Requisitos Previos

- **Node.js** 20 o superior
- **pnpm** (gestor de paquetes)
- **Git** (para clonar el repositorio)

## Instalar pnpm

Si no tienes pnpm instalado:

```bash
# Con npm
npm install -g pnpm

# Con curl (Linux/Mac)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Verificar instalación
pnpm --version
```

## Instalación del Proyecto

### 1. Clonar el repositorio (o descargar archivos)

```bash
git clone <tu-repositorio> audio-recorder
cd audio-recorder
```

### 2. Instalar dependencias

```bash
pnpm install
```

Esto instalará todas las dependencias necesarias:
- React, React DOM
- Vite
- Tailwind CSS
- Motion (Framer Motion)
- Express
- Multer
- CORS

### 3. Verificar instalación

```bash
# Ver versión de Node
node --version  # Debe ser 20+

# Ver versión de pnpm
pnpm --version

# Ver dependencias instaladas
pnpm list
```

## Estructura Después de la Instalación

```
audio-recorder/
├── node_modules/        ← Dependencias instaladas
├── dist/                ← Build (se crea con pnpm build)
├── src/                 ← Código fuente
├── server/              ← Backend
├── public/              ← Archivos estáticos
└── ...
```

## Siguientes Pasos

Una vez instalado, puedes:

### Desarrollo
```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Backend  
pnpm server
```

### Producción
```bash
# Construir
pnpm build

# Iniciar
pnpm start
```

### Docker
```bash
docker-compose up -d
```

## Problemas Comunes

### Error: "pnpm: command not found"
```bash
npm install -g pnpm
```

### Error de permisos en Linux
```bash
sudo chown -R $USER:$USER .
```

### Puerto 3001 o 5173 ocupado
```bash
# Cambiar puerto en vite.config.js o .env
```

### Módulos no encontrados
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Verificar que Todo Funciona

```bash
# 1. Construir
pnpm build

# 2. Probar en producción
pnpm start

# 3. Abrir en navegador
# http://localhost:3001

# 4. Verificar API
curl http://localhost:3001/api/health
```

## Ver También

- [QUICKSTART.md](QUICKSTART.md) - Inicio rápido
- [README.md](README.md) - Documentación general
- [DEPLOYMENT.md](DEPLOYMENT.md) - Despliegue en VPS
