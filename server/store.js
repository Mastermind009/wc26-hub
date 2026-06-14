import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'predictions.json');

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { predictions: [] };
  }
}

async function writeDb(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function getPredictionsByClient(clientId) {
  const db = await readDb();
  return db.predictions.filter((p) => p.clientId === clientId);
}

export async function getAllPredictions() {
  const db = await readDb();
  return db.predictions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function upsertPredictions({ clientId, displayName, predictions }) {
  const db = await readDb();
  const now = new Date().toISOString();

  for (const entry of predictions) {
    const idx = db.predictions.findIndex(
      (p) => p.clientId === clientId && p.matchId === entry.matchId,
    );
    const record = {
      clientId,
      displayName,
      matchId: entry.matchId,
      homeScore: entry.homeScore,
      awayScore: entry.awayScore,
      updatedAt: now,
    };
    if (idx >= 0) db.predictions[idx] = record;
    else db.predictions.push(record);
  }

  await writeDb(db);
  return getPredictionsByClient(clientId);
}
