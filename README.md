# o-229 Education

> 🎓 Plateforme SaaS Multi-Tenant de Gestion Scolaire

## Quick Start (Docker)

```bash
# 1. Create your environment file from template
cp .env.docker.example .env.docker
# Edit .env.docker with your actual credentials

# 2. Build & start all services
docker-compose up -d --build

# 3. Install Laravel dependencies
docker exec -it o229-app composer install

# 4. Generate app key
docker exec -it o229-app php artisan key:generate

# 5. Run migrations
docker exec -it o229-app php artisan migrate --seed

# 6. Create storage symlink
docker exec -it o229-app php artisan storage:link

# 7. Access
# API: http://localhost/api/v1
# WebSocket: ws://localhost:8080
# MinIO: http://localhost:9001
```

## Architecture

| Service | Container | Port |
|---------|-----------|------|
| Nginx | o229-nginx | 80/443 |
| Laravel (PHP-FPM) | o229-app | 9000 |
| PostgreSQL 16 | o229-postgres | 5432 |
| Redis 7 | o229-redis | 6379 |
| Queue Worker | o229-queue | — |
| Scheduler | o229-scheduler | — |
| Reverb WebSocket | o229-reverb | 8080 |
| MinIO (S3) | o229-minio | 9000/9001 |

## Domain: o-229.com
- `école1.o-229.com` → Tenant School 1
- `école2.o-229.com` → Tenant School 2
- DNS via **Cloudflare** (wildcard `*.o-229.com`)

## Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `backend/.env` | Laravel app config | ❌ Never |
| `backend/.env.example` | Template for `.env` | ✅ Yes |
| `.env.docker` | Docker services credentials | ❌ Never |
| `.env.docker.example` | Template for `.env.docker` | ✅ Yes |

> ⚠️ **NEVER commit files containing real credentials to Git.**
