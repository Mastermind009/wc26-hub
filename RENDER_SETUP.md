# Render deploy checklist

Repo: https://github.com/Mastermind009/wc26-hub

## If Render service is not live yet

1. Open: https://render.com/deploy?repo=https://github.com/Mastermind009/wc26-hub
2. Click **Apply** (uses `render.yaml` in the repo)
3. In Render dashboard → your service → **Environment**
4. Add: `ADMIN_SECRET` = `12345`
5. Wait for deploy to finish (5–10 min first time)
6. Open your service URL (e.g. `https://wc26-hub.onrender.com`)

## Share with friends

Send them your Render URL. They use **Predictions** tab.

## Admin

**Predictions → Admin** → enter `12345` → **All picks (Admin)**
