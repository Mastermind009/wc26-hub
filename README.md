# WC26 Hub

A live FIFA World Cup 2026 dashboard with match schedules, scores, player cards, and smart filters.

## Features

- **Live match data** — All 104 matches with real-time scores from [worldcup26.ir](https://worldcup26.ir)
- **Player cards** — Star players with ratings, positions, clubs, and tournament stats
- **Filters**
  - **By Team** — Show matches for any of the 48 nations
  - **IST Friendly** — Matches kicking off between 9:00 AM – 3:30 AM IST (inclusive)
  - **Hot Matches** — Games featuring top nations (Argentina, France, Brazil, etc.)

- **Predictions** — Visitors predict match scores; only the admin can view everyone's picks

## Quick Start

```bash
npm install
npm run dev:all
```

Open http://localhost:5173

Predictions require the local API server (`dev:all` runs both Vite and the prediction backend).

### Admin access

1. Copy `.env.example` to `.env`
2. Set a strong `ADMIN_SECRET`
3. In the **Predictions** tab, click **Admin** and enter that secret
4. Switch to **All picks (Admin)** to see every submission

Regular visitors only see and edit their own predictions.

## Deploy (free — share with friends)

**One-click Render deploy:**  
https://render.com/deploy?repo=https://github.com/Mastermind009/wc26-hub

After deploy starts, set environment variable in Render dashboard:
- `ADMIN_SECRET` = `12345` (or your own secret)

See **[DEPLOY.md](./DEPLOY.md)** for details.

## Data Sources

| Data | Source |
|------|--------|
| Matches, teams, stadiums | [worldcup26.ir API](https://worldcup26.ir) |
| Player profiles | Curated squad data |

## Scripts

- `npm run dev` — Frontend only (Vite)
- `npm run dev:server` — Prediction API only
- `npm run dev:all` — Frontend + prediction API (recommended)
- `npm run build` — Production build
- `npm start` — Serve built app + prediction API
