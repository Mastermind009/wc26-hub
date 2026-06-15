import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAllData } from './api';
import type { EnrichedMatch, MatchFilter, Stadium, Team } from './types';
import { enrichMatch, sortMatchesForDisplay } from './utils';
import { getTopPlayers } from './data/players';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MatchList } from './components/MatchList';
import { PlayerGrid } from './components/PlayerGrid';
import { PredictionsTab } from './components/PredictionsTab';
import { StatsBar } from './components/StatsBar';
import './App.css';

const POLL_INTERVAL = 60_000;

export default function App() {
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<MatchFilter>('all');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'predictions'>('matches');
  const hasLoadedData = useRef(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { matches: rawMatches, teams: rawTeams, stadiums, partial } = await fetchAllData();
      const stadiumMap = new Map<string, Stadium>(stadiums.map((s) => [s.id, s]));
      const enriched = sortMatchesForDisplay(
        rawMatches.map((m) => enrichMatch(m, stadiumMap)),
      );

      setMatches(enriched);
      setTeams(rawTeams.sort((a, b) => a.name_en.localeCompare(b.name_en)));
      hasLoadedData.current = enriched.length > 0;
      setError(
        partial && enriched.length === 0
          ? 'Some match data is still loading. Tap refresh to try again.'
          : null,
      );
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(
        hasLoadedData.current
          ? `${message} — showing last loaded data.`
          : `${message} — tap refresh to retry.`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(() => loadData(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [loadData]);

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (activeFilter === 'team' && selectedTeam) {
      result = result.filter(
        (m) => m.home_team_name_en === selectedTeam || m.away_team_name_en === selectedTeam,
      );
    }

    if (activeFilter === 'ist') {
      result = result.filter((m) => m.isIstFriendly);
    }

    if (activeFilter === 'hot') {
      result = result.filter((m) => m.isHot);
    }

    return result;
  }, [matches, activeFilter, selectedTeam]);

  const topPlayers = useMemo(() => getTopPlayers(), []);

  const liveCount = matches.filter((m) => m.isLive).length;
  const finishedCount = matches.filter((m) => m.finished === 'TRUE').length;

  return (
    <div className="app">
      <Header lastUpdated={lastUpdated} onRefresh={() => loadData()} />

      <main className="main">
        <StatsBar
          totalMatches={matches.length}
          liveCount={liveCount}
          finishedCount={finishedCount}
          teamCount={teams.length}
        />

        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
          <button
            className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Player Cards
          </button>
          <button
            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            Predictions
          </button>
        </nav>

        {activeTab === 'matches' ? (
          <>
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              teams={teams}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              resultCount={filteredMatches.length}
            />
            <MatchList
              matches={filteredMatches}
              teams={teams}
              loading={loading}
              error={error}
            />
          </>
        ) : activeTab === 'players' ? (
          <PlayerGrid players={topPlayers} teams={teams} />
        ) : (
          <PredictionsTab matches={matches} teams={teams} />
        )}
      </main>

      <footer className="footer">
        <p>
          Live data from{' '}
          <a href="https://worldcup26.ir" target="_blank" rel="noreferrer">
            worldcup26.ir
          </a>
          {' · '}Updates every 60s
        </p>
      </footer>
    </div>
  );
}
