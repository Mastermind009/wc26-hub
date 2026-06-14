import type { EnrichedMatch, Match, Stadium } from './types';

export const HOT_TEAMS = new Set([
  'Argentina',
  'France',
  'Brazil',
  'England',
  'Spain',
  'Portugal',
  'Germany',
  'Netherlands',
  'Belgium',
  'Croatia',
  'Uruguay',
  'Colombia',
  'United States',
  'Mexico',
  'Japan',
  'Morocco',
  'Italy',
]);

const STADIUM_TIMEZONES: Record<string, string> = {
  '1': 'America/Mexico_City',
  '2': 'America/Mexico_City',
  '3': 'America/Monterrey',
  '4': 'America/Chicago',
  '5': 'America/Chicago',
  '6': 'America/Chicago',
  '7': 'America/New_York',
  '8': 'America/New_York',
  '9': 'America/New_York',
  '10': 'America/New_York',
  '11': 'America/New_York',
  '12': 'America/Toronto',
  '13': 'America/Vancouver',
  '14': 'America/Los_Angeles',
  '15': 'America/Los_Angeles',
  '16': 'America/Los_Angeles',
};

export function parseLocalDate(localDate: string, stadiumId: string): Date {
  const [datePart, timePart] = localDate.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const tz = STADIUM_TIMEZONES[stadiumId] ?? 'America/New_York';

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  let offset = 0;
  for (let i = 0; i < 48; i++) {
    const test = new Date(utcGuess + offset);
    const parts = formatter.formatToParts(test);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
    const fMonth = Number(get('month'));
    const fDay = Number(get('day'));
    const fHour = Number(get('hour'));
    const fMin = Number(get('minute'));

    if (fMonth === month && fDay === day && fHour === hour && fMin === minute) {
      return test;
    }
    offset += 15 * 60 * 1000;
  }

  return new Date(utcGuess);
}

function getIstParts(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { hour, minute };
}

export function toIst(date: Date): Date {
  return date;
}

export function formatIst(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function isIstFriendly(kickoffUtc: Date): boolean {
  const { hour, minute } = getIstParts(kickoffUtc);
  const totalMinutes = hour * 60 + minute;
  const morningStart = 9 * 60; // 9:00 AM
  const nightEnd = 3 * 60 + 30; // 3:30 AM (inclusive)
  return totalMinutes >= morningStart || totalMinutes <= nightEnd;
}

export function isHotMatch(home: string, away: string): boolean {
  return HOT_TEAMS.has(home) || HOT_TEAMS.has(away);
}

export function isLiveMatch(match: Match): boolean {
  const elapsed = match.time_elapsed?.toLowerCase() ?? '';
  return elapsed !== 'notstarted' && elapsed !== 'finished' && match.finished !== 'TRUE';
}

export function enrichMatch(match: Match, stadiums: Map<string, Stadium>): EnrichedMatch {
  const stadium = stadiums.get(match.stadium_id);
  const kickoffUtc = parseLocalDate(match.local_date, match.stadium_id);

  return {
    ...match,
    stadiumName: stadium?.name_en ?? 'TBD',
    stadiumCity: stadium?.city_en ?? '',
    stadiumCountry: stadium?.country_en ?? '',
    kickoffIst: kickoffUtc,
    kickoffIstLabel: formatIst(kickoffUtc),
    isLive: isLiveMatch(match),
    isHot: isHotMatch(match.home_team_name_en, match.away_team_name_en),
    isIstFriendly: isIstFriendly(kickoffUtc),
  };
}

export function parseScorers(raw: string): string[] {
  if (!raw || raw === 'null') return [];
  try {
    const parsed = JSON.parse(raw.replace(/'/g, '"'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw
      .replace(/[{}"]/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function getMatchStatus(match: EnrichedMatch): { label: string; tone: 'live' | 'done' | 'upcoming' } {
  if (match.isLive) return { label: match.time_elapsed, tone: 'live' };
  if (match.finished === 'TRUE') return { label: 'Full Time', tone: 'done' };
  return { label: 'Upcoming', tone: 'upcoming' };
}

export function getStageLabel(match: EnrichedMatch): string {
  if (match.type === 'group') return `Group ${match.group} · MD ${match.matchday}`;
  if (match.type === 'r32') return 'Round of 32';
  if (match.type === 'r16') return 'Round of 16';
  if (match.type === 'qf') return 'Quarter-final';
  if (match.type === 'sf') return 'Semi-final';
  if (match.type === 'third') return '3rd Place';
  if (match.type === 'final') return 'Final';
  return match.type;
}

export function getTeamDisplayName(match: EnrichedMatch, side: 'home' | 'away'): string {
  const name = side === 'home' ? match.home_team_name_en : match.away_team_name_en;
  const label = side === 'home' ? match.home_team_label : match.away_team_label;
  if (name && name.trim()) return name;
  return label ?? 'TBD';
}
