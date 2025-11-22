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

.DEFAULT_GOAL := help
