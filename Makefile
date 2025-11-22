.PHONY: help install dev build start docker-build docker-up docker-down docker-logs clean

help: ## Muestra esta ayuda
	@echo "Audio Recorder - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Instala las dependencias con pnpm
	pnpm install

dev: ## Inicia el servidor de desarrollo (requiere dos terminales)
	@echo "⚠️  Necesitas ejecutar esto en dos terminales:"
	@echo "  Terminal 1: pnpm dev"
	@echo "  Terminal 2: pnpm server"

build: ## Construye el frontend para producción
	pnpm build

start: build ## Inicia el servidor en modo producción (local)
	NODE_ENV=production pnpm start

docker-build: ## Construye la imagen Docker
	docker-compose build

docker-up: ## Levanta los contenedores (simple)
	docker-compose up -d
	@echo ""
	@echo "✅ Aplicación corriendo en http://localhost"

docker-nginx: ## Levanta con Nginx como proxy
	docker-compose -f docker-compose.nginx.yml up -d
	@echo ""
	@echo "✅ Aplicación corriendo en http://localhost (Nginx proxy)"

docker-down: ## Detiene los contenedores
	docker-compose down

docker-logs: ## Muestra los logs de los contenedores
	docker-compose logs -f

docker-restart: ## Reinicia los contenedores
	docker-compose restart

docker-rebuild: docker-down docker-build docker-up ## Reconstruye y reinicia todo

clean: ## Limpia archivos generados
	rm -rf node_modules dist server/recordings/*.webm

backup: ## Crea backup de las grabaciones
	@mkdir -p backups
	tar -czf backups/recordings-backup-$$(date +%Y%m%d-%H%M%S).tar.gz server/recordings/
	@echo "✅ Backup creado en backups/"

ssl-setup: ## Guía para configurar SSL con Let's Encrypt
	@echo "🔒 Configuración SSL para vvaldes.me"
	@echo ""
	@echo "Sigue estos pasos:"
	@echo "1. Verifica DNS: nslookup vvaldes.me"
	@echo "2. Instala Certbot: sudo apt install certbot python3-certbot-nginx -y"
	@echo "3. Detén Docker: docker compose -f docker-compose.nginx.yml down"
	@echo "4. Obtén certificado: sudo certbot certonly --standalone -d vvaldes.me -d www.vvaldes.me"
	@echo "5. Activa SSL: make ssl-enable"
	@echo "6. Inicia Docker: docker compose -f docker-compose.nginx.yml up -d"
	@echo ""
	@echo "📖 Documentación completa en SSL_SETUP.md"

ssl-enable: ## Activa la configuración SSL (después de obtener certificado)
	@echo "🔄 Activando configuración SSL..."
	cp nginx/default.conf nginx/default.conf.backup
	cp nginx/default.conf.ssl nginx/default.conf
	@echo "✅ Configuración SSL activada"
	@echo "⚠️  Ahora ejecuta: docker compose -f docker-compose.nginx.yml up -d"

ssl-disable: ## Desactiva la configuración SSL (vuelve a HTTP)
	@echo "🔄 Desactivando configuración SSL..."
	@if [ -f nginx/default.conf.backup ]; then \
		cp nginx/default.conf.backup nginx/default.conf; \
		echo "✅ Configuración HTTP restaurada"; \
	else \
		echo "❌ No se encontró backup. Restaura manualmente desde git."; \
	fi

ssl-check: ## Verifica el estado de los certificados SSL
	@echo "🔍 Verificando certificados SSL..."
	@sudo certbot certificates || echo "⚠️  Certbot no instalado o sin certificados"

.DEFAULT_GOAL := help
