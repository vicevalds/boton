# 🚀 Despliegue Rápido con Nginx

## Opción 1: Docker Simple (Recomendado)

Solo Node.js sirviendo todo:

```bash
cd ~/boton
docker compose up -d
```

Acceso: **http://tu-ip** o **http://tu-ip:3001**

---

## Opción 2: Docker con Nginx (Proxy Reverso)

Nginx como proxy + Node.js backend:

```bash
cd ~/boton
docker compose -f docker-compose.nginx.yml up -d
```

Acceso: **http://tu-ip** (puerto 80)

### Ventajas de usar Nginx:
- ✅ Mejor rendimiento para archivos estáticos
- ✅ Compresión gzip automática
- ✅ Fácil agregar HTTPS con Let's Encrypt
- ✅ Rate limiting y cache
- ✅ Más robusto en producción

---

## 🔒 Habilitar HTTPS con Let's Encrypt

### Paso 1: Preparar dominio

Asegúrate de que tu dominio apunte al servidor:

```bash
# Verificar DNS
nslookup tudominio.com
```

### Paso 2: Editar configuración Nginx

```bash
nano nginx/default.conf
```

Cambia `server_name localhost;` por:
```nginx
server_name tudominio.com www.tudominio.com;
```

### Paso 3: Instalar Certbot

```bash
# Instalar certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Paso 4: Detener contenedor Nginx temporalmente

```bash
docker compose -f docker-compose.nginx.yml stop nginx
```

### Paso 5: Obtener certificado

```bash
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com
```

### Paso 6: Actualizar configuración Nginx

Edita `nginx/default.conf` y agrega:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # ... resto de configuración
}
```

Actualiza `docker-compose.nginx.yml`:

```yaml
  nginx:
    image: nginx:alpine
    container_name: audio-recorder-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro  # Agregar esta línea
```

### Paso 7: Reiniciar

```bash
docker compose -f docker-compose.nginx.yml up -d
```

---

## 📋 Comandos Útiles

```bash
# Ver logs
docker compose logs -f

# Ver solo logs de Nginx
docker compose logs -f nginx

# Reiniciar Nginx
docker compose restart nginx

# Ver estado
docker compose ps

# Detener todo
docker compose down

# Reconstruir
docker compose up -d --build
```

---

## 🔧 Troubleshooting

### Puerto 80 ocupado

```bash
# Ver qué usa el puerto
sudo lsof -i :80

# Detener Apache/Nginx del sistema
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Error de permisos

```bash
sudo chown -R $USER:$USER ~/boton
```

### Reiniciar desde cero

```bash
docker compose down -v
docker system prune -af
docker compose up -d --build
```

---

## 🎯 Resumen

**Para desarrollo/pruebas:**
```bash
docker compose up -d
```

**Para producción con Nginx:**
```bash
docker compose -f docker-compose.nginx.yml up -d
```

**Acceso:**
- Sin Nginx: http://tu-ip:3001
- Con Nginx: http://tu-ip
- Con HTTPS: https://tudominio.com

