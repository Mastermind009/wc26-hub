import { useState } from 'react';
import type { EnrichedMatch, Team } from '../types';
import { getMatchStatus, getStageLabel, getTeamDisplayName, parseScorers } from '../utils';
import { MatchDetailModal } from './MatchDetailModal';

interface MatchListProps {
  matches: EnrichedMatch[];
  teams: Team[];
  loading: boolean;
  error: string | null;
}

function getFlag(teams: Team[], teamName: string): string {
  return teams.find((t) => t.name_en === teamName)?.flag ?? '';
}

export function MatchList({ matches, teams, loading, error }: MatchListProps) {
  const [selectedMatch, setSelectedMatch] = useState<EnrichedMatch | null>(null);

  if (loading && matches.length === 0) {
    return <div className="state-msg">Loading matches…</div>;
  }

  if (error && matches.length === 0) {
    return (
      <div className="state-msg error">
        <p>{error}</p>
        <button type="button" className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return <div className="state-msg">No matches match your filters.</div>;
  }

  return (
    <>
      <section className="match-list">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            teams={teams}
            onSelect={() => setSelectedMatch(match)}
          />
        ))}
      </section>

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          teams={teams}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
}

function MatchCard({
  match,
  teams,
  onSelect,
}: {
  match: EnrichedMatch;
  teams: Team[];
  onSelect: () => void;
}) {
  const status = getMatchStatus(match);
  const homeScorers = parseScorers(match.home_scorers);
  const awayScorers = parseScorers(match.away_scorers);
  const hasScore = match.finished === 'TRUE' || match.isLive;
  const homeName = getTeamDisplayName(match, 'home');
  const awayName = getTeamDisplayName(match, 'away');

  return (
    <article
      className={`match-card clickable ${match.isHot ? 'hot' : ''} ${match.isLive ? 'live' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${homeName} vs ${awayName}`}
    >
      <div className="match-meta">
        <div>
          <span className="match-number">Match {match.id}</span>
          <span className="stage">{getStageLabel(match)}</span>
        </div>
        <span className={`status status-${status.tone}`}>
          {match.isLive && <span className="live-dot" />}
          {status.label}
        </span>
      </div>

      <div className="match-teams">
        <TeamRow
          name={homeName}
          flag={getFlag(teams, match.home_team_name_en)}
          scorers={homeScorers}
        />
        <div className="scoreboard">
          {hasScore ? (
            <>
              <span className="score">{match.home_score}</span>
              <span className="score-separator">-</span>
              <span className="score">{match.away_score}</span>
            </>
          ) : (
            <span className="vs">VS</span>
          )}
        </div>
        <TeamRow
          name={awayName}
          flag={getFlag(teams, match.away_team_name_en)}
          scorers={awayScorers}
          align="right"
        />
      </div>

      <div className="match-footer">
        <div className="kickoff">
          <span className="kickoff-ist">🇮🇳 {match.kickoffIstLabel}</span>
          {match.isIstFriendly && <span className="ist-badge">IST Friendly</span>}
        </div>
        <span className="venue">
          {match.stadiumName}
          {match.stadiumCity && ` · ${match.stadiumCity}`}
        </span>
      </div>

      <div className="card-badges">
        {match.isHot && <span className="hot-badge">Hot Match</span>}
        {match.isLive && <span className="live-badge">Live</span>}
      </div>

      <span className="match-tap-hint">Tap for details</span>
    </article>
  );
}

function TeamRow({
  name,
  flag,
  scorers,
  align = 'left',
}: {
  name: string;
  flag: string;
  scorers: string[];
  align?: 'left' | 'right';
}) {
  return (
    <div className={`team-row ${align}`}>
      {flag && <img src={flag} alt="" className="team-flag" loading="lazy" />}
      <div className="team-info">
        <span className="team-name">{name}</span>
        {scorers.length > 0 && (
          <span className="scorers">{scorers.join(', ')}</span>
        )}
      </div>
    </div>
  );
}
