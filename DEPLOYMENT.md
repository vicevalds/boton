# 🚀 Guía de Despliegue en VPS

Esta guía te ayudará a desplegar la aplicación Audio Recorder en tu VPS.

## 📋 Requisitos Previos

- VPS con Ubuntu/Debian (u otra distribución Linux)
- Acceso SSH al servidor
- Docker y Docker Compose instalados
- Dominio apuntando al servidor (opcional, para HTTPS)

## 🔧 Instalación de Docker (si no está instalado)

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version
```

Cierra sesión y vuelve a entrar para que los cambios surtan efecto.

## 📦 Despliegue de la Aplicación

### Opción 1: Despliegue Simple (Recomendado)

Esta opción usa solo Node.js para servir tanto el frontend como el backend.

```bash
# 1. Clonar el repositorio (o subir los archivos)
git clone <tu-repositorio> audio-recorder
cd audio-recorder

# 2. Construir y levantar contenedores
docker-compose up -d

# 3. Verificar que esté corriendo
docker-compose ps
docker-compose logs -f
```

La aplicación estará disponible en:
- **http://tu-servidor-ip:80** (frontend)
- **http://tu-servidor-ip:3001** (acceso directo al backend)

### Opción 2: Con Apache como Proxy Reverso

Si prefieres usar Apache como proxy reverso (útil para múltiples aplicaciones):

```bash
# 1. Clonar el repositorio
git clone <tu-repositorio> audio-recorder
cd audio-recorder

# 2. Usar la configuración con Apache
docker-compose -f docker-compose.apache.yml up -d

# 3. Verificar
docker-compose -f docker-compose.apache.yml ps
```

## 🌐 Configuración de Dominio

### Sin Apache (Opción 1)

Si usas un dominio, simplemente apunta tu DNS A record a la IP del servidor:

```
A     @     123.456.789.123
A     www   123.456.789.123
```

### Con Apache (Opción 2)

1. Edita el archivo de configuración:

```bash
nano apache/vhost.conf
```

2. Cambia `ServerName localhost` por tu dominio:

```apache
ServerName tudominio.com
ServerAlias www.tudominio.com
```

3. Reinicia Apache:

```bash
docker-compose -f docker-compose.apache.yml restart apache
```

## 🔒 Habilitar HTTPS con Let's Encrypt

### Para Opción 1 (Sin Apache)

Usa un proxy reverso como Nginx Proxy Manager o Traefik. Ejemplo con Nginx:

```bash
# Instalar nginx y certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Configurar nginx como proxy
sudo nano /etc/nginx/sites-available/audio-recorder

# Agregar configuración:
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/audio-recorder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

### Para Opción 2 (Con Apache)

```bash
# Acceder al contenedor de Apache
docker exec -it audio-recorder-apache sh

# Instalar certbot
apk add certbot certbot-apache

# Obtener certificado
certbot --apache -d tudominio.com -d www.tudominio.com

# Salir del contenedor
exit

# El certificado se renovará automáticamente
```

## 🔍 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f app

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build

# Ver estado de contenedores
docker-compose ps
```

### Gestión de Grabaciones

```bash
# Ver grabaciones
ls -lh server/recordings/

# Espacio usado
du -sh server/recordings/

# Limpiar grabaciones antiguas (más de 30 días)
find server/recordings/ -name "*.webm" -mtime +30 -delete
```

### Backup de Grabaciones

```bash
# Crear backup
tar -czf recordings-backup-$(date +%Y%m%d).tar.gz server/recordings/

# Restaurar backup
tar -xzf recordings-backup-YYYYMMDD.tar.gz
```

## 🛡️ Seguridad

### Firewall

```bash
# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir SSH
sudo ufw allow 22/tcp

# Habilitar firewall
sudo ufw enable
```

### Limitar Tamaño de Grabaciones

Para evitar que el disco se llene, puedes:

1. **Configurar cron para limpiar grabaciones antiguas:**

```bash
crontab -e

# Agregar línea para limpiar cada día a las 3 AM
0 3 * * * find /home/user/audio-recorder/server/recordings -name "*.webm" -mtime +30 -delete
```

2. **Limitar espacio del volumen Docker:**

Edita `docker-compose.yml` y agrega:

```yaml
volumes:
  - ./server/recordings:/app/server/recordings
    driver_opts:
      size: "10G"  # Limitar a 10GB
```

## 🔄 Actualización de la Aplicación

```bash
# 1. Detener contenedores
docker-compose down

# 2. Actualizar código
git pull origin main

# 3. Reconstruir y levantar
docker-compose up -d --build

# 4. Verificar
docker-compose logs -f
```

## 📊 Monitoreo

### Health Check

```bash
# Verificar que la API esté funcionando
curl http://localhost/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2024-..."}
```

### Logs del Sistema

```bash
# Ver logs del sistema Docker
journalctl -u docker -f

# Ver uso de recursos
docker stats audio-recorder-app
```

## 🆘 Troubleshooting

### Puerto 80 ya está en uso

```bash
# Ver qué proceso está usando el puerto
sudo lsof -i :80

# Detener Apache/Nginx si existe
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Permisos de grabaciones

```bash
# Asegurar permisos correctos
chmod 755 server/recordings
```

### El micrófono no funciona en producción

El navegador requiere HTTPS para acceder al micrófono (excepto en localhost). Asegúrate de:
1. Tener HTTPS configurado (Let's Encrypt)
2. O acceder desde `localhost` para pruebas

### Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Reconstruir desde cero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📈 Optimizaciones de Producción

### 1. Configurar Nginx como CDN Cache (opcional)

```nginx
# Cachear archivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    proxy_pass http://localhost:3001;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Comprimir Respuestas

Ya está habilitado en Express, pero puedes configurar compresión en Nginx/Apache.

### 3. Rate Limiting

Limitar requests para prevenir abuso:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:3001;
}
```

## 📞 Soporte

Si encuentras problemas, revisa:
1. Logs de Docker: `docker-compose logs -f`
2. Logs del navegador (Consola del desarrollador)
3. Conectividad: `curl http://localhost/api/health`

---

¡Listo! Tu aplicación debería estar funcionando perfectamente. 🎉

