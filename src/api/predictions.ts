export interface Prediction {
  clientId: string;
  displayName: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  updatedAt: string;
}

export interface PredictionInput {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

const PREDICTIONS_API = '/api';

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchMyPredictions(clientId: string): Promise<Prediction[]> {
  const res = await fetch(`${PREDICTIONS_API}/predictions/${clientId}`);
  const data = await parseResponse<{ predictions: Prediction[] }>(res);
  return data.predictions;
}

export async function submitPredictions(payload: {
  clientId: string;
  displayName: string;
  predictions: PredictionInput[];
}): Promise<Prediction[]> {
  const res = await fetch(`${PREDICTIONS_API}/predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ predictions: Prediction[] }>(res);
  return data.predictions;
}

export async function verifyAdminSecret(secret: string): Promise<boolean> {
  const res = await fetch(`${PREDICTIONS_API}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret }),
  });
  return res.ok;
}

export async function fetchAllPredictions(adminSecret: string): Promise<Prediction[]> {
  const res = await fetch(`${PREDICTIONS_API}/admin/predictions`, {
    headers: { 'X-Admin-Secret': adminSecret },
  });
  const data = await parseResponse<{ predictions: Prediction[] }>(res);
  return data.predictions;
}
