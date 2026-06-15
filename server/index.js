import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllPredictions, getPredictionsByDisplayName, upsertPredictions } from './store.js';
import { getWcBundle, getWcData } from './wcProxy.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'wc26-admin-change-me';

const app = express();
app.use(cors());
app.use(express.json());

function isAdmin(req) {
  return req.headers['x-admin-secret'] === ADMIN_SECRET;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/admin/verify', (req, res) => {
  const { secret } = req.body ?? {};
  if (secret === ADMIN_SECRET) {
    res.json({ ok: true });
    return;
  }
  res.status(401).json({ error: 'Invalid admin secret' });
});

app.get('/api/predictions/mine', async (req, res) => {
  try {
    const displayName = String(req.query.displayName ?? '').trim();
    if (!displayName) {
      res.status(400).json({ error: 'displayName query parameter is required' });
      return;
    }
    const predictions = await getPredictionsByDisplayName(displayName);
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/predictions', async (req, res) => {
  try {
    const { clientId, displayName, predictions } = req.body ?? {};
    if (!displayName?.trim()) {
      res.status(400).json({ error: 'displayName is required' });
      return;
    }
    if (!Array.isArray(predictions) || predictions.length === 0) {
      res.status(400).json({ error: 'predictions array is required' });
      return;
    }

    for (const p of predictions) {
      if (!p.matchId) {
        res.status(400).json({ error: 'Each prediction needs a matchId' });
        return;
      }
      const home = Number(p.homeScore);
      const away = Number(p.awayScore);
      if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
        res.status(400).json({ error: 'Scores must be non-negative integers' });
        return;
      }
    }

    const saved = await upsertPredictions({
      clientId: clientId ?? 'anonymous',
      displayName: displayName.trim(),
      predictions: predictions.map((p) => ({
        matchId: String(p.matchId),
        homeScore: Number(p.homeScore),
        awayScore: Number(p.awayScore),
      })),
    });

    res.json({ predictions: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/predictions', async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const predictions = await getAllPredictions();
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/data', async (_req, res) => {
  try {
    const bundle = await getWcBundle();
    res.json(bundle);
  } catch (err) {
    res.status(502).json({ error: 'World Cup API unavailable' });
  }
});

app.use('/api/wc', async (req, res) => {
  try {
    const data = await getWcData(req.url || '/');
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'World Cup API unavailable' });
  }
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found' });
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, HOST, () => {
  console.log(`WC26 Hub server running on http://${HOST}:${PORT}`);
  console.log(`Admin secret: set ADMIN_SECRET env var (default is for dev only)`);
});
