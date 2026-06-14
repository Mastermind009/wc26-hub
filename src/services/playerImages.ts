const SEARCH_NAMES: Record<string, string> = {
  'Kylian Mbappé': 'Mbappe',
  'Lionel Messi': 'Messi',
  'Cristiano Ronaldo': 'Cristiano Ronaldo',
  'Neymar Jr': 'Neymar',
  'Vinícius Júnior': 'Vinicius Junior',
};

const WIKI_TITLES: Record<string, string> = {
  'Kylian Mbappé': 'Kylian_Mbappé',
  'Lionel Messi': 'Lionel_Messi',
  'Cristiano Ronaldo': 'Cristiano_Ronaldo',
  'Neymar Jr': 'Neymar',
  'Vinícius Júnior': 'Vinícius_Júnior',
};

async function fromSportsDb(name: string): Promise<string | null> {
  const query = SEARCH_NAMES[name] ?? name;
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    player?: Array<{ strCutout?: string; strThumb?: string }>;
  };
  const player = data.player?.[0];
  return player?.strCutout || player?.strThumb || null;
}

async function fromWikipedia(name: string): Promise<string | null> {
  const title = WIKI_TITLES[name] ?? name.replace(/ /g, '_');
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { thumbnail?: { source: string } };
  return data.thumbnail?.source ?? null;
}

export async function fetchPlayerImage(playerName: string): Promise<string | null> {
  try {
    return (await fromSportsDb(playerName)) ?? (await fromWikipedia(playerName));
  } catch {
    return null;
  }
}

export async function fetchPlayerImages(
  names: string[],
): Promise<Record<string, string | null>> {
  const entries = await Promise.all(
    names.map(async (name) => [name, await fetchPlayerImage(name)] as const),
  );
  return Object.fromEntries(entries);
}
