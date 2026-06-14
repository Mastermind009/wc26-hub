export interface Team {
  id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
}

export interface Stadium {
  id: string;
  name_en: string;
  city_en: string;
  country_en: string;
  region: 'Eastern' | 'Central' | 'Western';
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_team_label?: string;
  away_team_label?: string;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  teamCode: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  number: number;
  age: number;
  club: string;
  nationality: string;
  rating: number;
  goals?: number;
  assists?: number;
  image?: string;
}

export type MatchFilter = 'all' | 'team' | 'ist' | 'hot';

export interface EnrichedMatch extends Match {
  stadiumName: string;
  stadiumCity: string;
  stadiumCountry: string;
  kickoffIst: Date;
  kickoffIstLabel: string;
  isLive: boolean;
  isHot: boolean;
  isIstFriendly: boolean;
}
