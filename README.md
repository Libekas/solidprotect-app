# Solid Protect Sales App

## Struktuur
- `backend/` — Node.js/Express API
- `frontend/` — React/Vite UI

## Render.com deploy

### 1. PostgreSQL
- New → PostgreSQL
- Nimi: `solidprotect-db`
- Kopeeri Internal Database URL

### 2. Backend (Web Service)
- New → Web Service
- Repo: solidprotect-app, Root: `backend`
- Build: `npm install`
- Start: `node src/index.js`
- Env muutujad:
  - DATABASE_URL = (PostgreSQL Internal URL)
  - ANTHROPIC_API_KEY = (sinu key)
  - APOLLO_API_KEY = BCHiPsq_O-ZXlAZ37xUGog
  - JWT_SECRET = (tugev random string)
  - SETUP_KEY = (random string kasutaja loomiseks)
  - FRONTEND_URL = https://app.tarkvarakirjastus.ee

### 3. DB init (üks kord)
- Backend Shell: `node src/db-init.js`

### 4. Loo kasutaja (üks kord)
```
curl -X POST https://YOUR-API.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"taavi","password":"SINU_PAROOL","setupKey":"SINU_SETUP_KEY"}'
```

### 5. Frontend (Static Site)
- New → Static Site
- Repo: solidprotect-app, Root: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`
- Env: VITE_API_URL = https://YOUR-API.onrender.com/api

### 6. Custom domain
- Frontend Static Site → Settings → Custom Domains
- Lisa: app.tarkvarakirjastus.ee
- DNS: CNAME → render URL

## Apollo constraint (üks kord pärast DB init)
```
curl -X POST https://YOUR-API.onrender.com/api/apollo/setup-constraint \
  -H "Authorization: Bearer YOUR_TOKEN"
```
