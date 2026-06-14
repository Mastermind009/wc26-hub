# Deployment guide

Your friends need a **public URL** with both the website and prediction API running together. The easiest free option is **Render**.

## Recommended: Render (free)

### What you get
- Public URL like `https://wc26-hub.onrender.com`
- Friends worldwide can visit and submit predictions
- You log in as admin with your `ADMIN_SECRET`

### Limitations (free tier)
- The app **sleeps after ~15 minutes** of no traffic (first visit may take 30–60s to wake up)
- Predictions are stored in a file on the server and **persist between visits**, but can be **lost if you redeploy** the app

### Steps

1. **Push this project to GitHub**
   ```bash
   git add .
   git commit -m "Prepare WC26 Hub for deployment"
   git push origin main
   ```
   Create a repo on [github.com/new](https://github.com/new) if you don't have one yet.

2. **Sign up at [render.com](https://render.com)** (free, GitHub login works)

3. **New → Blueprint** (or **Web Service**)
   - Connect your GitHub repo
   - Render reads `render.yaml` automatically if using Blueprint
   - Or manually set:
     - **Build command:** `npm install && npm run build`
     - **Start command:** `npm start`
     - **Instance type:** Free

4. **Add environment variable**
   - Key: `ADMIN_SECRET`
   - Value: `12345` (or something stronger)

5. **Deploy** — Render gives you a live URL to share

---

## Share with friends

Send them your Render URL, e.g.:

```
https://wc26-hub.onrender.com
```

They can:
- Browse matches
- Open **Predictions**, enter their name, and save scores

You can:
- Go to **Predictions → Admin**
- Enter your `ADMIN_SECRET`
- View **All picks (Admin)**

---

## Other free options

| Platform | Good for | Caveat |
|----------|----------|--------|
| [Render](https://render.com) | Easiest full-stack Node deploy | Sleeps when idle |
| [Fly.io](https://fly.io) | Always-on feel | Slightly more setup |
| [Railway](https://railway.app) | Quick deploy | Limited free credits |

---

## Local tunnel (temporary, not real deploy)

If you only need a quick test link while your PC is on:

```bash
npx localtunnel --port 3001
```

This is **not** suitable for friends long-term — your computer must stay on.

---

## Production checklist

- [ ] Change `ADMIN_SECRET` from `12345` to something strong
- [ ] Push latest code to GitHub
- [ ] Deploy on Render with `ADMIN_SECRET` set
- [ ] Test predictions from your phone (not on home Wi‑Fi)
- [ ] Share the public URL
