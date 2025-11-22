# Audio Recorder - Grabador de Audio con Botón Circular

Aplicación web de grabación de audio con un botón interactivo de estilo Instagram. Los usuarios pueden mantener presionado el botón para grabar hasta 60 segundos de audio, y luego reproducir las grabaciones.

## 🎯 Características

- **Botón de grabación circular**: Diseño similar al botón de grabación de Instagram con progreso radial
- **Grabación de audio**: Hasta 60 segundos por grabación
- **Reproducción**: Lista de todas las grabaciones con reproductor integrado
- **Backend API**: Servidor Express para gestionar y almacenar grabaciones
- **Dockerizado**: Listo para desplegar en VPS con Docker + Apache

## 🏗️ Arquitectura

- **Frontend**: React + Vite + Tailwind CSS + Motion (Framer Motion)
- **Backend**: Node.js + Express + Multer
- **Web Server**: Apache (proxy reverso)
- **Contenedores**: Docker + Docker Compose

## 📋 Requisitos Previos

- Node.js 20+
- pnpm (gestor de paquetes)
- Docker y Docker Compose (para despliegue)

## 🚀 Instalación y Desarrollo

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Desarrollo local

Ejecutar en modo desarrollo (requiere dos terminales):

```bash
# Terminal 1: Frontend (Vite)
pnpm dev

# Terminal 2: Backend (Express)
pnpm server
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 3. Build de producción

```bash
pnpm build
```

## 🐳 Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

La aplicación estará disponible en http://localhost (puerto 80)

### Opción 2: Solo Docker

```bash
# Construir imagen
docker build -t audio-recorder .

# Ejecutar contenedor
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/server/recordings:/app/server/recordings \
  --name audio-recorder \
  audio-recorder
```

## 📁 Estructura del Proyecto

```
boton/
├── src/                      # Código fuente del frontend
│   ├── components/           # Componentes React
│   │   ├── RecordButton.jsx  # Botón de grabación circular
│   │   └── AudioPlayer.jsx   # Reproductor de audio
│   ├── App.jsx               # Componente principal
│   ├── main.jsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── server/                   # Servidor backend
│   ├── index.js              # API Express
│   └── recordings/           # Grabaciones (creado automáticamente)
├── apache/                   # Configuración Apache
│   ├── httpd.conf            # Configuración principal
│   └── vhost.conf            # Virtual host
├── public/                   # Archivos estáticos
│   └── fonts/                # Fuentes web
├── docker-compose.yml        # Orquestación Docker
├── Dockerfile                # Imagen Docker
├── package.json              # Dependencias del proyecto
└── vite.config.js            # Configuración Vite

```

## 🔌 API Endpoints

### POST /api/upload
Sube una nueva grabación de audio.
- **Body**: FormData con campo `audio` (archivo .webm)
- **Response**: `{ success: true, filename: string, path: string }`

### GET /api/recordings
Obtiene lista de todas las grabaciones.
- **Response**: Array de `{ filename: string, timestamp: Date, size: number }`

### GET /api/recordings/:filename
Descarga una grabación específica.
- **Response**: Archivo de audio

### DELETE /api/recordings/:filename
Elimina una grabación.
- **Response**: `{ success: true }`

### GET /api/health
Health check del servidor.
- **Response**: `{ status: "ok", timestamp: string }`

## 🎨 Estilo del Botón

El botón de grabación utiliza:
- **Progreso circular radial**: Gradiente cónico (`conic-gradient`) que se llena al grabar
- **Animaciones fluidas**: Motion (Framer Motion) para transiciones suaves
- **Feedback visual**: Escala, colores y temporizador en tiempo real
- **Diseño responsive**: Adaptable a diferentes tamaños de pantalla

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes configurar el servidor con variables de entorno:

```bash
PORT=3001              # Puerto del servidor backend
NODE_ENV=production    # Entorno (development/production)
```

### Personalización de Límites

Para cambiar la duración máxima de grabación, edita:

```javascript
// src/components/RecordButton.jsx
const MAX_DURATION = 60000; // 60 segundos en milisegundos
```

## 🌐 Despliegue en VPS

1. **Clonar repositorio en el VPS**:
```bash
git clone <tu-repositorio>
cd boton
```

2. **Asegurarte de tener Docker instalado**:
```bash
docker --version
docker-compose --version
```

3. **Levantar servicios**:
```bash
docker-compose up -d
```

4. **Configurar dominio (opcional)**:
Edita `apache/vhost.conf` y cambia `ServerName localhost` por tu dominio.

5. **Habilitar HTTPS (opcional)**:
Usa Let's Encrypt con certbot para SSL:
```bash
docker exec -it audio-recorder-apache apk add certbot certbot-apache
docker exec -it audio-recorder-apache certbot --apache
```

## 🛠️ Troubleshooting

### El micrófono no funciona
- Verifica que el navegador tenga permisos de micrófono
- Solo funciona en HTTPS o localhost (requisito del navegador)

### Error al subir grabaciones
- Verifica que el directorio `server/recordings` tenga permisos de escritura
- Revisa los logs del servidor: `docker-compose logs app`

### Apache no sirve archivos estáticos
- Verifica que el build de Vite se haya completado: `pnpm build`
- Revisa la configuración del volumen en `docker-compose.yml`

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando React, Express y Docker.

