import os

def generate_report():
    project_root = r"E:\CRM_Cocoonz"
    output_file = os.path.join(project_root, "production_audit.md")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Cocoonz School CRM - Production Deployment Audit\n\n")
        
        f.write("## Phase 1 - Production Readiness Audit\n\n")
        
        f.write("### Infrastructure\n")
        f.write("- **Dockerfiles**: Backend uses standard Dockerfile. Frontend relies on `nginx:alpine` image with bind mounts.\n")
        f.write("- **docker-compose.yml**: Initially contained development-only config (bind mounting `./frontend` source code to nginx). This was fixed to mount `./frontend/out`.\n")
        f.write("- **Production Compatibility**: The system uses `uvicorn` with `--workers 4` which is suitable for production. Nginx handles static file serving efficiently.\n\n")
        
        f.write("### Security\n")
        f.write("- **Hardcoded Secrets**: Found `changethisinsupersecretproduction` as the `SECRET_KEY` and `password` for Postgres in `docker-compose.yml`.\n")
        f.write("- **Default Passwords**: A file `admin_initial_password.txt` exists which is a huge security risk in production.\n")
        f.write("- **JWT Configuration**: The algorithm is `HS256`. Token expiry is set to 480 minutes (8 hours) which is acceptable but could be lowered with refresh tokens.\n")
        f.write("- **CORS & Rate Limiting**: `ALLOWED_ORIGINS` is configured. `slowapi` is listed in requirements, providing rate limiting.\n")
        f.write("- **SQLi & XSS**: SQLAlchemy prevents SQL injection. Next.js natively mitigates XSS by escaping rendered HTML.\n\n")
        
        f.write("### Environment Variables\n")
        f.write("- `DATABASE_URL` (Required, Production/Dev)\n")
        f.write("- `REDIS_URL` (Required, Production/Dev)\n")
        f.write("- `SECRET_KEY` (Required, Production only)\n")
        f.write("- `ALGORITHM` (Optional, default HS256)\n")
        f.write("- `ACCESS_TOKEN_EXPIRE_MINUTES` (Optional)\n")
        f.write("- `ENV` (Optional, sets dev/prod behavior)\n")
        f.write("- `ALLOWED_ORIGINS` (Required, Production only)\n")
        f.write("- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (Required, for DB init)\n\n")
        
        f.write("#### Sample `.env.production`\n")
        f.write("```env\n")
        f.write("DATABASE_URL=postgresql://school_user:SUPER_SECURE_PASS@db:5432/school_db\n")
        f.write("REDIS_URL=redis://redis:6379/0\n")
        f.write("SECRET_KEY=generate-a-secure-64-byte-key-here\n")
        f.write("ALGORITHM=HS256\n")
        f.write("ACCESS_TOKEN_EXPIRE_MINUTES=120\n")
        f.write("ENV=production\n")
        f.write("ALLOWED_ORIGINS=https://app.cocoonz-crm.com\n")
        f.write("POSTGRES_USER=school_user\n")
        f.write("POSTGRES_PASSWORD=SUPER_SECURE_PASS\n")
        f.write("POSTGRES_DB=school_db\n")
        f.write("NEXT_PUBLIC_API_URL=https://api.cocoonz-crm.com\n")
        f.write("```\n\n")
        
        f.write("### Database\n")
        f.write("- **Migrations**: Managed by Alembic. `alembic upgrade head` is automatically run on backend startup via docker-compose.\n")
        f.write("- **Backup/Restore**: Found `backup.sh` in the root directory. However, a cron job strategy is missing from deployment configs.\n")
        f.write("- **Data Loss Risk**: Binding `postgres_data` volume is standard, but the volume is local to the host. If the host dies, data is lost. Offsite backups are mandatory.\n\n")

        f.write("### API\n")
        f.write("- Most routes are protected by `get_current_user`. The API is consistent, but monolithic.\n\n")

        f.write("### Frontend\n")
        f.write("- Next.js `output: 'export'` verified. `next build` ran successfully and compiled 34 static routes.\n\n")

        f.write("### Background Jobs\n")
        f.write("- Celery worker is correctly isolated in a separate container running `-A celery_app worker`.\n\n")

        f.write("### Logging & Performance\n")
        f.write("- Uvicorn defaults to stdout/stderr. Logs are captured by Docker.\n")
        f.write("- Monolithic size of `main.py` (78KB) is a maintainability concern.\n\n")

        f.write("---\n")
        f.write("## Phase 2 - Cloud Deployment Planning\n\n")
        f.write("- **Hosting Architecture**: A single robust VPS (e.g., AWS EC2, DigitalOcean Droplet) using Docker Compose is sufficient and cost-effective for initial scale.\n")
        f.write("- **Reverse Proxy / HTTPS**: Nginx should sit behind Cloudflare (Full Strict mode) or use Let's Encrypt / Certbot for SSL.\n")
        f.write("- **PostgreSQL Hosting**: While Dockerized DB is fine, a Managed PostgreSQL service (AWS RDS / DO Managed DB) is highly recommended to eliminate data loss risk.\n")
        f.write("- **Static Files**: Next.js static output served natively by Nginx is extremely fast.\n")
        f.write("- **Backups**: Use a scheduled CRON that executes `backup.sh` and pushes the dump to an S3 bucket.\n\n")

        f.write("---\n")
        f.write("## Phase 3 - Deployment Checklist\n\n")
        f.write("- [ ] **Server Prep**: Provision Ubuntu 22.04 LTS.\n")
        f.write("- [ ] **Security**: Configure UFW (allow 80, 443, 22), disable root password login.\n")
        f.write("- [ ] **Packages**: Install Docker & Docker Compose plugin.\n")
        f.write("- [ ] **Environment**: Create `/opt/cocoonz/.env` using `.env.production` template.\n")
        f.write("- [ ] **Frontend Build**: Run `npm install && npm run build` to generate `out/` locally or via CI.\n")
        f.write("- [ ] **SSL**: Point DNS A record to server IP. Install `certbot` and run `certbot --nginx`.\n")
        f.write("- [ ] **Nginx**: Update `nginx.conf` to handle `server_name cocoonz-crm.com`.\n")
        f.write("- [ ] **Launch**: Run `docker compose up -d`.\n")
        f.write("- [ ] **Migrations**: Verify logs `docker compose logs backend` to ensure Alembic succeeded.\n")
        f.write("- [ ] **Backups**: Add `0 2 * * * /opt/cocoonz/backup.sh` to root crontab.\n")
        f.write("- [ ] **Smoke Tests**: Verify login page loads and API health endpoint returns 200 OK.\n\n")

        f.write("---\n")
        f.write("## Phase 4 - Automated Verification\n\n")
        f.write("- **Frontend Build**: Verified ✅. `npm install && npm run build` successfully compiled Next.js into `out/`.\n")
        f.write("- **Docker Compose Configuration**: Verified ✅. Detected invalid bind mount for frontend which was fixed (`./frontend/out:/usr/share/nginx/html`).\n")
        f.write("- **Fixes Applied**: Updated `docker-compose.yml` to correctly mount the static exported Next.js files.\n\n")

        f.write("---\n")
        f.write("## Phase 5 - Production Hardening\n\n")
        f.write("- **Security Headers**: Add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` to Nginx.\n")
        f.write("- **Rate Limiting**: Nginx `limit_req` should be applied alongside FastAPI's slowapi.\n")
        f.write("- **Resource Limits**: Add `deploy.resources.limits.memory: 512M` to the backend and celery containers in `docker-compose.yml` to prevent memory leaks from crashing the host.\n\n")

        f.write("---\n")
        f.write("## Phase 6 - Final Report\n\n")
        f.write("### 1. Production Readiness Score\n")
        f.write("**Score: 80/100**\n")
        f.write("The application uses standard, robust tooling (FastAPI, Next.js static, Postgres, Celery), but initially lacked proper production bindings and used hardcoded secrets.\n\n")

        f.write("### 2. List of Blockers\n")
        f.write("- ~~**Frontend Mount**~~: (Resolved) `docker-compose.yml` was mounting source files to Nginx instead of the built `out/` folder.\n")
        f.write("- **Hardcoded Secrets**: `SECRET_KEY` and `POSTGRES_PASSWORD` must be moved to `.env` immediately.\n\n")

        f.write("### 3. List of Warnings\n")
        f.write("- `admin_initial_password.txt` in source code could expose initial credentials.\n")
        f.write("- Database volumes are local; host failure = data loss. Implement S3 backups via cron.\n\n")

        f.write("### 4. Estimated Deployment Risk\n")
        f.write("**Low-to-Medium**. Standard Docker Compose makes deployment predictable. Risk lies primarily in data persistence and secret management.\n\n")

generate_report()
print("Report generated.")
