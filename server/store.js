import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'predictions.json');

function normalizeDisplayName(name) {
  return name.trim().toLowerCase();
}

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

export async function getPredictionsByDisplayName(displayName) {
  const db = await readDb();
  const key = normalizeDisplayName(displayName);
  return db.predictions
    .filter((p) => normalizeDisplayName(p.displayName) === key)
    .sort((a, b) => a.matchId.localeCompare(b.matchId, undefined, { numeric: true }));
}

export async function getAllPredictions() {
  const db = await readDb();
  return db.predictions.sort((a, b) => {
    const nameCmp = normalizeDisplayName(a.displayName).localeCompare(
      normalizeDisplayName(b.displayName),
    );
    if (nameCmp !== 0) return nameCmp;
    return a.matchId.localeCompare(b.matchId, undefined, { numeric: true });
  });
}

export async function upsertPredictions({ clientId, displayName, predictions }) {
  const db = await readDb();
  const now = new Date().toISOString();
  const trimmedName = displayName.trim();
  const nameKey = normalizeDisplayName(trimmedName);

  for (const entry of predictions) {
    const idx = db.predictions.findIndex(
      (p) => normalizeDisplayName(p.displayName) === nameKey && p.matchId === entry.matchId,
    );
    const record = {
      clientId,
      displayName: trimmedName,
      matchId: entry.matchId,
      homeScore: entry.homeScore,
      awayScore: entry.awayScore,
      updatedAt: now,
    };
    if (idx >= 0) db.predictions[idx] = record;
    else db.predictions.push(record);
  }

  await writeDb(db);
  return getPredictionsByDisplayName(trimmedName);
}
