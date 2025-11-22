# Audio Recorder - Grabador de Audio con Botón Circular

🎙️ Aplicación web de grabación de audio con un botón interactivo de estilo Instagram.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Terminal 1: Frontend
pnpm dev

# Terminal 2: Backend
pnpm server
```

Accede a: http://localhost:5173

### Despliegue con Docker

```bash
# Opción 1: Docker simple (recomendado)
docker-compose up -d

# Opción 2: Con Apache como proxy
docker-compose -f docker-compose.apache.yml up -d
```

Accede a: http://localhost

## 📋 Características

✅ Botón de grabación circular con progreso radial (estilo Instagram)  
✅ Grabación de audio hasta 60 segundos  
✅ Lista de reproducción de grabaciones  
✅ Backend API con Express  
✅ Dockerizado y listo para VPS  

## 📖 Documentación

- [Documentación Completa](README.proyecto.md)
- [Guía de Despliegue en VPS](DEPLOYMENT.md)

## 🛠️ Stack Tecnológico

- React + Vite + Tailwind CSS
- Motion (Framer Motion)
- Node.js + Express
- Docker + Docker Compose

## 📸 Preview

El botón de grabación se inspira en el diseño del botón original incluido en el proyecto, con un efecto de relleno circular radial que muestra el progreso de la grabación visualmente.

## 🎨 Estilo

El proyecto utiliza el sistema de diseño incluido con:
- Fuentes personalizadas (DD, JetBrains Mono)
- Paleta de colores consistente
- Animaciones fluidas con Motion
- Diseño responsive

## 📄 Licencia

MIT
