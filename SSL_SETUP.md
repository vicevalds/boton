# 🔒 Configuración HTTPS con Let's Encrypt para input.vvaldes.me

Esta guía te ayudará a configurar un certificado SSL gratuito para tu subdominio **input.vvaldes.me** usando Let's Encrypt y Certbot.

## 📋 Prerrequisitos

1. **Dominio configurado**: Tu subdominio `input.vvaldes.me` debe apuntar a la IP de tu servidor
2. **Puerto 80 abierto**: Necesario para la verificación de Let's Encrypt
3. **Puerto 443 abierto**: Necesario para HTTPS

## ✅ Paso 1: Verificar DNS

Asegúrate de que tu subdominio apunte correctamente a tu servidor:

```bash
# Verificar que input.vvaldes.me apunta a tu servidor
nslookup input.vvaldes.me
```

Deberías ver la IP de tu servidor en el resultado.

## 🔧 Paso 2: Instalar Certbot

En tu servidor Ubuntu, instala Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

## 🛑 Paso 3: Preparar el entorno

**IMPORTANTE**: Primero detén cualquier servicio que esté usando el puerto 80:

```bash
# Detener contenedores Docker si están corriendo
cd ~/Documents/git/boton
docker compose -f docker-compose.nginx.yml down

# Verificar que el puerto 80 esté libre
sudo lsof -i :80

# Si hay algo corriendo en el puerto 80 (Apache, Nginx del sistema, etc.)
sudo systemctl stop nginx    # Si tienes Nginx instalado en el sistema
sudo systemctl stop apache2  # Si tienes Apache instalado
```

## 🎫 Paso 4: Obtener el certificado SSL

Ejecuta Certbot en modo standalone para obtener tu certificado:

```bash
sudo certbot certonly --standalone -d input.vvaldes.me
```

Certbot te hará algunas preguntas:
- **Email**: Proporciona tu email (para notificaciones de renovación)
- **Términos**: Acepta los términos de servicio (Y)
- **Newsletter**: Opcional (Y/N)

Si todo va bien, verás un mensaje como:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/input.vvaldes.me/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/input.vvaldes.me/privkey.pem
```

## 🔐 Paso 5: Configurar Nginx para HTTPS

Ya he actualizado tu configuración para incluir `input.vvaldes.me` como server_name. Ahora necesitas crear la configuración SSL completa.

Crea un nuevo archivo de configuración con soporte HTTPS:

```bash
# Hacer backup de la configuración actual
cp nginx/default.conf nginx/default.conf.backup
```

Ahora actualiza `nginx/default.conf` con esta configuración:

```nginx
upstream backend {
    server app:3001;
    keepalive 32;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name input.vvaldes.me;
    
    # Location para Let's Encrypt renovación
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirigir todo el tráfico HTTP a HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name input.vvaldes.me;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/input.vvaldes.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/input.vvaldes.me/privkey.pem;
    
    # Configuración SSL moderna y segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Tamaño máximo de carga (para grabaciones de audio)
    client_max_body_size 50M;

    # Timeouts
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Bloquear patrones de ataque comunes
    location ~* (\.\.\/|cgi-bin|\.env|\.git|\.svn|wp-admin|phpmyadmin) {
        deny all;
        return 403;
    }

    # Rate limiting para API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy para toda la aplicación (Node.js sirve frontend y backend)
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers de proxy
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|woff|ttf|svg)$ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🚀 Paso 6: Iniciar la aplicación con HTTPS

```bash
# Asegúrate de estar en el directorio del proyecto
cd ~/Documents/git/boton

# Iniciar con Docker Compose
docker compose -f docker-compose.nginx.yml up -d

# Ver los logs para verificar que todo está bien
docker compose -f docker-compose.nginx.yml logs -f
```

## 🔄 Paso 7: Configurar renovación automática

Los certificados de Let's Encrypt expiran cada 90 días. Certbot ya viene con un timer de systemd para renovación automática.

Verifica que esté activo:

```bash
sudo systemctl status certbot.timer
```

Para probar la renovación (sin renovar realmente):

```bash
sudo certbot renew --dry-run
```

Si todo funciona correctamente, Certbot renovará automáticamente tus certificados antes de que expiren.

## 🎉 Paso 8: Verificar HTTPS

Abre tu navegador y accede a:

- ✅ https://input.vvaldes.me

Verifica que:
1. El candado verde (🔒) aparece en la barra de direcciones
2. El certificado muestra "Let's Encrypt"
3. No hay advertencias de seguridad

También puedes probar tu configuración SSL en:
- https://www.ssllabs.com/ssltest/analyze.html?d=input.vvaldes.me

## 🛠️ Comandos útiles

```bash
# Ver estado de certificados
sudo certbot certificates

# Renovar manualmente (si es necesario)
sudo certbot renew

# Reiniciar Nginx después de renovación
docker compose -f docker-compose.nginx.yml restart nginx

# Ver logs de Nginx
docker compose -f docker-compose.nginx.yml logs nginx

# Verificar configuración de Nginx
docker compose -f docker-compose.nginx.yml exec nginx nginx -t
```

## ⚠️ Troubleshooting

### Error: "Connection refused" al obtener certificado

- Verifica que el puerto 80 esté abierto en tu firewall
- Asegúrate de que ningún otro servicio esté usando el puerto 80

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### Error: "DNS lookup failed"

- Verifica que tu dominio apunte a la IP correcta
- Espera unos minutos si acabas de cambiar el DNS (propagación)

### El certificado no se renueva automáticamente

```bash
# Ver logs de renovación
sudo journalctl -u certbot.timer

# Forzar renovación si faltan menos de 30 días
sudo certbot renew --force-renewal
```

### Docker no puede leer los certificados

```bash
# Verificar permisos
sudo ls -la /etc/letsencrypt/live/input.vvaldes.me/

# Los certificados deben ser legibles (normalmente ya lo son)
```

## 📚 Recursos adicionales

- [Documentación oficial de Let's Encrypt](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://eff-certbot.readthedocs.io/)
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Probar tu configuración SSL
- [Tutorial DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)

## ✨ Resumen del proceso

1. ✅ Instalar Certbot
2. ✅ Detener servicios en puerto 80
3. ✅ Obtener certificado: `sudo certbot certonly --standalone -d input.vvaldes.me`
4. ✅ Actualizar configuración de Nginx con HTTPS
5. ✅ Iniciar Docker con `docker compose -f docker-compose.nginx.yml up -d`
6. ✅ Verificar acceso a https://input.vvaldes.me

---

**¡Tu sitio ahora está seguro con HTTPS! 🎉🔒**

