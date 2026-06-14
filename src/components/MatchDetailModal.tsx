import { useEffect } from 'react';
import type { EnrichedMatch, Team } from '../types';
import {
  getMatchStatus,
  getStageLabel,
  getTeamDisplayName,
  parseScorers,
} from '../utils';

interface MatchDetailModalProps {
  match: EnrichedMatch;
  teams: Team[];
  onClose: () => void;
}

function getFlag(teams: Team[], teamName: string): string {
  return teams.find((t) => t.name_en === teamName)?.flag ?? '';
}

export function MatchDetailModal({ match, teams, onClose }: MatchDetailModalProps) {
  const status = getMatchStatus(match);
  const homeName = getTeamDisplayName(match, 'home');
  const awayName = getTeamDisplayName(match, 'away');
  const homeScorers = parseScorers(match.home_scorers);
  const awayScorers = parseScorers(match.away_scorers);
  const hasScore = match.finished === 'TRUE' || match.isLive;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-detail-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-header">
          <div>
            <span className="match-number">Match {match.id}</span>
            <h2 id="match-detail-title">{getStageLabel(match)}</h2>
          </div>
          <span className={`status status-${status.tone}`}>
            {match.isLive && <span className="live-dot" />}
            {status.label}
          </span>
        </div>

        <div className="modal-scoreboard">
          <TeamBlock
            name={homeName}
            flag={getFlag(teams, match.home_team_name_en)}
            score={hasScore ? match.home_score : null}
            scorers={homeScorers}
          />
          <div className="modal-vs">
            {hasScore ? (
              <span className="modal-score-line">
                {match.home_score} - {match.away_score}
              </span>
            ) : (
              <span className="vs">VS</span>
            )}
          </div>
          <TeamBlock
            name={awayName}
            flag={getFlag(teams, match.away_team_name_en)}
            score={hasScore ? match.away_score : null}
            scorers={awayScorers}
            align="right"
          />
        </div>

        <div className="modal-details-grid">
          <DetailItem label="Kickoff (IST)" value={match.kickoffIstLabel} />
          <DetailItem label="Local time" value={match.local_date.replace(' ', ' · ')} />
          <DetailItem label="Stadium" value={match.stadiumName} />
          <DetailItem
            label="Venue"
            value={[match.stadiumCity, match.stadiumCountry].filter(Boolean).join(', ') || 'TBD'}
          />
          <DetailItem label="Match type" value={match.type.toUpperCase()} />
          {match.type === 'group' && (
            <>
              <DetailItem label="Group" value={`Group ${match.group}`} />
              <DetailItem label="Matchday" value={match.matchday} />
            </>
          )}
          {match.time_elapsed && match.time_elapsed !== 'notstarted' && (
            <DetailItem label="Clock" value={match.time_elapsed} />
          )}
        </div>

        <div className="modal-tags">
          {match.isHot && <span className="hot-badge">Hot Match</span>}
          {match.isIstFriendly && <span className="ist-badge">IST Friendly</span>}
          {match.isLive && <span className="live-badge">Live</span>}
          {match.finished === 'TRUE' && <span className="done-badge">Full Time</span>}
        </div>

        {(homeScorers.length > 0 || awayScorers.length > 0) && (
          <div className="modal-scorers">
            <h3>Goal scorers</h3>
            <div className="scorer-columns">
              <div>
                <strong>{homeName}</strong>
                <ul>
                  {homeScorers.length > 0 ? (
                    homeScorers.map((s) => <li key={s}>{s}</li>)
                  ) : (
                    <li className="muted">No goals</li>
                  )}
                </ul>
              </div>
              <div>
                <strong>{awayName}</strong>
                <ul>
                  {awayScorers.length > 0 ? (
                    awayScorers.map((s) => <li key={s}>{s}</li>)
                  ) : (
                    <li className="muted">No goals</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamBlock({
  name,
  flag,
  score,
  scorers,
  align = 'left',
}: {
  name: string;
  flag: string;
  score: string | null;
  scorers: string[];
  align?: 'left' | 'right';
}) {
  return (
    <div className={`modal-team ${align}`}>
      {flag && <img src={flag} alt="" className="team-flag" />}
      <div>
        <span className="team-name">{name}</span>
        {score !== null && <span className="modal-team-score">{score}</span>}
        {scorers.length > 0 && <span className="scorers">{scorers.join(', ')}</span>}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
