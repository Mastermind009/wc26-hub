import type { Match, Stadium, Team } from './types';

const API_BASE = '/api';
const RETRYABLE = new Set([404, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry<T>(path: string): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(`${API_BASE}${path}`);
      if (!res.ok) {
        if (RETRYABLE.has(res.status) && attempt < MAX_ATTEMPTS - 1) {
          await sleep(1500 * (attempt + 1));
          continue;
        }
        throw new Error(`API error: ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Request failed');
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(1500 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error('Request failed');
}

interface BundleResponse {
  games: Match[];
  teams: Team[];
  stadiums: Stadium[];
  partial?: boolean;
}

export async function fetchAllData() {
  const data = await fetchJsonWithRetry<BundleResponse>('/data');
  return {
    matches: data.games ?? [],
    teams: data.teams ?? [],
    stadiums: data.stadiums ?? [],
    partial: Boolean(data.partial),
  };
}

// Kept for compatibility with any direct callers.
export async function fetchMatches(): Promise<Match[]> {
  const data = await fetchAllData();
  return data.matches;
}

export async function fetchTeams(): Promise<Team[]> {
  const data = await fetchAllData();
  return data.teams;
}

export async function fetchStadiums(): Promise<Stadium[]> {
  const data = await fetchAllData();
  return data.stadiums;
}
