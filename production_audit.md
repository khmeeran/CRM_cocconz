# Cocoonz School CRM - Production Deployment Audit

## Phase 1 - Production Readiness Audit

### Infrastructure
- **Dockerfiles**: Backend uses standard Dockerfile. Frontend relies on `nginx:alpine` image with bind mounts.
- **docker-compose.yml**: Initially contained development-only config (bind mounting `./frontend` source code to nginx). This was fixed to mount `./frontend/out`.
- **Production Compatibility**: The system uses `uvicorn` with `--workers 4` which is suitable for production. Nginx handles static file serving efficiently.

### Security
- **Hardcoded Secrets**: Found `changethisinsupersecretproduction` as the `SECRET_KEY` and `password` for Postgres in `docker-compose.yml`.
- **Default Passwords**: A file `admin_initial_password.txt` exists which is a huge security risk in production.
- **JWT Configuration**: The algorithm is `HS256`. Token expiry is set to 480 minutes (8 hours) which is acceptable but could be lowered with refresh tokens.
- **CORS & Rate Limiting**: `ALLOWED_ORIGINS` is configured. `slowapi` is listed in requirements, providing rate limiting.
- **SQLi & XSS**: SQLAlchemy prevents SQL injection. Next.js natively mitigates XSS by escaping rendered HTML.

### Environment Variables
- `DATABASE_URL` (Required, Production/Dev)
- `REDIS_URL` (Required, Production/Dev)
- `SECRET_KEY` (Required, Production only)
- `ALGORITHM` (Optional, default HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (Optional)
- `ENV` (Optional, sets dev/prod behavior)
- `ALLOWED_ORIGINS` (Required, Production only)
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (Required, for DB init)

#### Sample `.env.production`
```env
DATABASE_URL=postgresql://school_user:SUPER_SECURE_PASS@db:5432/school_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=generate-a-secure-64-byte-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
ENV=production
ALLOWED_ORIGINS=https://app.cocoonz-crm.com
POSTGRES_USER=school_user
POSTGRES_PASSWORD=SUPER_SECURE_PASS
POSTGRES_DB=school_db
NEXT_PUBLIC_API_URL=https://api.cocoonz-crm.com
```

### Database
- **Migrations**: Managed by Alembic. `alembic upgrade head` is automatically run on backend startup via docker-compose.
- **Backup/Restore**: Found `backup.sh` in the root directory. However, a cron job strategy is missing from deployment configs.
- **Data Loss Risk**: Binding `postgres_data` volume is standard, but the volume is local to the host. If the host dies, data is lost. Offsite backups are mandatory.

### API
- Most routes are protected by `get_current_user`. The API is consistent, but monolithic.

### Frontend
- Next.js `output: 'export'` verified. `next build` ran successfully and compiled 34 static routes.

### Background Jobs
- Celery worker is correctly isolated in a separate container running `-A celery_app worker`.

### Logging & Performance
- Uvicorn defaults to stdout/stderr. Logs are captured by Docker.
- Monolithic size of `main.py` (78KB) is a maintainability concern.

---
## Phase 2 - Cloud Deployment Planning

- **Hosting Architecture**: A single robust VPS (e.g., AWS EC2, DigitalOcean Droplet) using Docker Compose is sufficient and cost-effective for initial scale.
- **Reverse Proxy / HTTPS**: Nginx should sit behind Cloudflare (Full Strict mode) or use Let's Encrypt / Certbot for SSL.
- **PostgreSQL Hosting**: While Dockerized DB is fine, a Managed PostgreSQL service (AWS RDS / DO Managed DB) is highly recommended to eliminate data loss risk.
- **Static Files**: Next.js static output served natively by Nginx is extremely fast.
- **Backups**: Use a scheduled CRON that executes `backup.sh` and pushes the dump to an S3 bucket.

---
## Phase 3 - Deployment Checklist

- [ ] **Server Prep**: Provision Ubuntu 22.04 LTS.
- [ ] **Security**: Configure UFW (allow 80, 443, 22), disable root password login.
- [ ] **Packages**: Install Docker & Docker Compose plugin.
- [ ] **Environment**: Create `/opt/cocoonz/.env` using `.env.production` template.
- [ ] **Frontend Build**: Run `npm install && npm run build` to generate `out/` locally or via CI.
- [ ] **SSL**: Point DNS A record to server IP. Install `certbot` and run `certbot --nginx`.
- [ ] **Nginx**: Update `nginx.conf` to handle `server_name cocoonz-crm.com`.
- [ ] **Launch**: Run `docker compose up -d`.
- [ ] **Migrations**: Verify logs `docker compose logs backend` to ensure Alembic succeeded.
- [ ] **Backups**: Add `0 2 * * * /opt/cocoonz/backup.sh` to root crontab.
- [ ] **Smoke Tests**: Verify login page loads and API health endpoint returns 200 OK.

---
## Phase 4 - Automated Verification

- **Frontend Build**: Verified ✅. `npm install && npm run build` successfully compiled Next.js into `out/`.
- **Docker Compose Configuration**: Verified ✅. Detected invalid bind mount for frontend which was fixed (`./frontend/out:/usr/share/nginx/html`).
- **Fixes Applied**: Updated `docker-compose.yml` to correctly mount the static exported Next.js files.

---
## Phase 5 - Production Hardening

- **Security Headers**: Add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` to Nginx.
- **Rate Limiting**: Nginx `limit_req` should be applied alongside FastAPI's slowapi.
- **Resource Limits**: Add `deploy.resources.limits.memory: 512M` to the backend and celery containers in `docker-compose.yml` to prevent memory leaks from crashing the host.

---
## Phase 6 - Final Report

### 1. Production Readiness Score
**Score: 80/100**
The application uses standard, robust tooling (FastAPI, Next.js static, Postgres, Celery), but initially lacked proper production bindings and used hardcoded secrets.

### 2. List of Blockers
- ~~**Frontend Mount**~~: (Resolved) `docker-compose.yml` was mounting source files to Nginx instead of the built `out/` folder.
- **Hardcoded Secrets**: `SECRET_KEY` and `POSTGRES_PASSWORD` must be moved to `.env` immediately.

### 3. List of Warnings
- `admin_initial_password.txt` in source code could expose initial credentials.
- Database volumes are local; host failure = data loss. Implement S3 backups via cron.

### 4. Estimated Deployment Risk
**Low-to-Medium**. Standard Docker Compose makes deployment predictable. Risk lies primarily in data persistence and secret management.

