const UPSTREAM_BASE = 'https://worldcup26.ir/get';
const CACHE_TTL_MS = 60_000;
const STALE_TTL_MS = 10 * 60_000;
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

const cache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCache(path) {
  return cache.get(path) ?? null;
}

function writeCache(path, data) {
  cache.set(path, { data, fetchedAt: Date.now() });
}

function isFresh(entry) {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

function isStale(entry) {
  return Date.now() - entry.fetchedAt < STALE_TTL_MS;
}

async function fetchUpstream(path) {
  const url = `${UPSTREAM_BASE}${path}`;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        lastError = new Error(`Upstream ${response.status}`);
        if (response.status >= 500 && attempt < MAX_RETRIES - 1) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error('Upstream unavailable');
}

export async function getWcData(path) {
  const cached = readCache(path);
  if (cached && isFresh(cached)) {
    return cached.data;
  }

  try {
    const data = await fetchUpstream(path);
    writeCache(path, data);
    return data;
  } catch (err) {
    if (cached && isStale(cached)) {
      return cached.data;
    }
    throw err;
  }
}

export async function getWcBundle() {
  const results = await Promise.allSettled([
    getWcData('/games'),
    getWcData('/teams'),
    getWcData('/stadiums'),
  ]);

  const games = results[0].status === 'fulfilled' ? results[0].value : null;
  const teams = results[1].status === 'fulfilled' ? results[1].value : null;
  const stadiums = results[2].status === 'fulfilled' ? results[2].value : null;

  if (!games && !teams && !stadiums) {
    const reason = results.find((r) => r.status === 'rejected');
    throw reason?.reason ?? new Error('World Cup API unavailable');
  }

  return {
    games: games?.games ?? [],
    teams: teams?.teams ?? [],
    stadiums: stadiums?.stadiums ?? [],
    partial: !(games && teams && stadiums),
  };
}
