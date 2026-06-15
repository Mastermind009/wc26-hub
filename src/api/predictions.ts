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

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  const retryable = new Set([404, 502, 503, 504]);
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, init);
    lastResponse = res;
    if (res.ok || !retryable.has(res.status) || attempt === 3) {
      return res;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }

  return lastResponse!;
}

export async function fetchMyPredictions(displayName: string): Promise<Prediction[]> {
  const params = new URLSearchParams({ displayName: displayName.trim() });
  const res = await fetchWithRetry(`${PREDICTIONS_API}/predictions/mine?${params}`);
  const data = await parseResponse<{ predictions: Prediction[] }>(res);
  return data.predictions;
}

export async function submitPredictions(payload: {
  clientId: string;
  displayName: string;
  predictions: PredictionInput[];
}): Promise<Prediction[]> {
  const res = await fetchWithRetry(`${PREDICTIONS_API}/predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ predictions: Prediction[] }>(res);
  return data.predictions;
}

export async function verifyAdminSecret(secret: string): Promise<boolean> {
  const res = await fetchWithRetry(`${PREDICTIONS_API}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret }),
  });
  return res.ok;
}

export async function fetchAllPredictions(adminSecret: string): Promise<Prediction[]> {
  const res = await fetchWithRetry(`${PREDICTIONS_API}/admin/predictions`, {
    headers: { 'X-Admin-Secret': adminSecret },
  });
  const data = await parseResponse<{ predictions: Prediction[] }>(res);
  return data.predictions;
}
