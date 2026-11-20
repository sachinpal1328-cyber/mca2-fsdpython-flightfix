# FlightFix — Deployment Guide (Supabase + Render + Netlify)

---

## 1. Supabase PostgreSQL Setup
1. Create a free project on [Supabase](https://supabase.com).
2. Go to **Project Settings → Database → Connection String (URI)** (Session Pooler or Transaction Pooler, port `6543` or `5432`).
3. Copy the URI and replace `[YOUR-PASSWORD]` with your database password:
   ```text
   postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
4. To initialize tables & demo data from your local machine against Supabase:
   ```bash
   cd backend
   set DATABASE_URL=postgresql://...   # or put in backend/.env
   venv\Scripts\python.exe manage.py migrate
   venv\Scripts\python.exe manage.py seed_flightfix
   ```

---

## 2. Backend Deployment on Render
1. Push the repository `mca2-fsdpython-flightfix` to GitHub.
2. In [Render](https://render.com), click **New → Blueprint** (uses `render.yaml`) or **New → Web Service**:
   - **Root Directory:** `backend`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - **Health Check Path:** `/api/health/`
3. Set Environment Variables in Render:
   - `DEBUG` = `False`
   - `SECRET_KEY` = *(auto-generated secure string)*
   - `DATABASE_URL` = *(your Supabase PostgreSQL URI)*
   - `ALLOWED_HOSTS` = `.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = `https://<your-netlify-site>.netlify.app`
4. After first deploy, open Render Shell (or run locally with `DATABASE_URL` pointing to Supabase) and run:
   ```bash
   python manage.py seed_flightfix
   ```

---

## 3. Frontend Deployment on Netlify
1. In [Netlify](https://netlify.com), click **Add new site → Import an existing project** and connect your GitHub repo.
2. Configure build settings (already defined in `frontend/netlify.toml`):
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Set Environment Variable in Netlify:
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api`
4. Deploy! `frontend/public/_redirects` ensures React Router paths work on page refresh.

---

## 4. Troubleshooting
- **CORS Errors:** Ensure `CORS_ALLOWED_ORIGINS` on Render includes the exact `https://...netlify.app` URL without a trailing slash.
- **502 / Cold Start on Render Free Tier:** First request after inactivity may take ~30–50 seconds on Render Free Tier; check `/api/health/` to verify DB connectivity.
