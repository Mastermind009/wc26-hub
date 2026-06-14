import { useEffect, useState } from 'react';
import type { Player, Team } from '../types';
import { fetchPlayerImages } from '../services/playerImages';

interface PlayerGridProps {
  players: Player[];
  teams: Team[];
}

const POSITION_COLORS: Record<Player['position'], string> = {
  GK: '#f59e0b',
  DF: '#3b82f6',
  MF: '#10b981',
  FW: '#ef4444',
};

export function PlayerGrid({ players, teams }: PlayerGridProps) {
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingImages(true);
    fetchPlayerImages(players.map((p) => p.name)).then((result) => {
      if (!cancelled) {
        setImages(result);
        setLoadingImages(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [players]);

  return (
    <section className="player-section">
      <div className="player-section-header">
        <h2>Top 5 Players</h2>
        <p>Star performers with live-fetched portraits</p>
      </div>

      <div className="player-grid top-players-grid">
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            teams={teams}
            imageUrl={images[player.name]}
            rank={index + 1}
            loadingImage={loadingImages}
          />
        ))}
      </div>
    </section>
  );
}

function PlayerCard({
  player,
  teams,
  imageUrl,
  rank,
  loadingImage,
}: {
  player: Player;
  teams: Team[];
  imageUrl?: string | null;
  rank: number;
  loadingImage: boolean;
}) {
  const flag = teams.find((t) => t.name_en === player.team)?.flag;
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <article className="player-card featured-player-card">
      <div className="player-photo-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={player.name} className="player-photo" loading="lazy" />
        ) : (
          <div className="player-photo-fallback">
            {loadingImage ? <span className="photo-loading">Loading…</span> : <span>{initials}</span>}
          </div>
        )}
        <span className="player-rank">#{rank}</span>
        <div className="player-rating">{player.rating}</div>
      </div>

      <div className="player-card-body">
        <h3 className="player-name">{player.name}</h3>

        <div className="player-team-row">
          {flag && <img src={flag} alt="" className="player-flag" loading="lazy" />}
          <span>{player.team}</span>
        </div>

        <div className="player-details">
          <span className="position" style={{ background: POSITION_COLORS[player.position] }}>
            {player.position}
          </span>
          <span className="club">{player.club}</span>
        </div>

        <div className="player-stats">
          <div>
            <span className="stat-num">{player.number}</span>
            <span className="stat-lbl">Shirt</span>
          </div>
          <div>
            <span className="stat-num">{player.age}</span>
            <span className="stat-lbl">Age</span>
          </div>
          {player.goals !== undefined && (
            <div>
              <span className="stat-num">{player.goals}</span>
              <span className="stat-lbl">Goals</span>
            </div>
          )}
          {player.assists !== undefined && (
            <div>
              <span className="stat-num">{player.assists}</span>
              <span className="stat-lbl">Assists</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
