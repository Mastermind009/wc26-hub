import type { Match, Stadium, Team } from './types';

const API_BASE = '/api/wc';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchMatches(): Promise<Match[]> {
  const data = await fetchJson<{ games: Match[] }>('/games');
  return data.games ?? [];
}

export async function fetchTeams(): Promise<Team[]> {
  const data = await fetchJson<{ teams: Team[] }>('/teams');
  return data.teams ?? [];
}

export async function fetchStadiums(): Promise<Stadium[]> {
  const data = await fetchJson<{ stadiums: Stadium[] }>('/stadiums');
  return data.stadiums ?? [];
}

export async function fetchAllData() {
  const [matches, teams, stadiums] = await Promise.all([
    fetchMatches(),
    fetchTeams(),
    fetchStadiums(),
  ]);
  return { matches, teams, stadiums };
}
