# Cocoonz School CRM - Beta Deployment Guide

This guide covers the steps to deploy the Cocoonz School CRM using the Zero-Cost Beta Architecture.

## 1. Database Setup (Supabase)

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **Project Settings > Database** and copy the **Connection string** (choose Transaction mode if available, but for Beta the direct connection is fine).
3. Update `DATABASE_URL` in your `.env` file with this string.
4. Run migrations to set up the schema:
   ```bash
   cd backend
   alembic upgrade head
   ```

## 2. Backend Deployment (Local Server)

The backend runs on your local PC and is exposed via Cloudflare Tunnel.

### Prerequisites
- Install [Cloudflare Tunnel (cloudflared)](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).

### Setup Tunnel
1. Login to Cloudflare:
   ```bash
   cloudflared tunnel login
   ```
2. Create a tunnel:
   ```bash
   cloudflared tunnel create cocoonz-api
   ```
3. Route the tunnel to a subdomain (e.g., `api.cocoonzschool.in`):
   ```bash
   cloudflared tunnel route dns cocoonz-api api.cocoonzschool.in
   ```
4. Run the tunnel (point it to your local backend port, default 8000):
   ```bash
   cloudflared tunnel run --url http://localhost:8000 cocoonz-api
   ```

### Running Backend
1. Set up your `.env` based on `.env.template`.
2. Start the FastAPI server:
   ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## 3. Frontend Deployment (Vercel)

1. Push the `frontend` directory to a new GitHub repository or as a subfolder in your existing one.
2. Connect the repository to [Vercel](https://vercel.com).
3. Set the **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_API_URL`: `https://api.cocoonzschool.in` (your Cloudflare tunnel URL).
4. Deploy.

## 4. Monitoring & Logs

- **Health Check**: `https://api.cocoonzschool.in/health`
- **Version**: `https://api.cocoonzschool.in/version`
- **Logs**: Located in `backend/logs/`
  - `app.log`: Application events.
  - `access.log`: HTTP request history.
  - `error.log`: Critical failures.

## 5. Security Checklist
- [ ] `SECRET_KEY` is a strong, random 32+ character string.
- [ ] `ENV` is set to `production` in `.env`.
- [ ] CORS is restricted to your Vercel domain.
- [ ] Supabase password is secure.
