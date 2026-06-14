interface StatsBarProps {
  totalMatches: number;
  liveCount: number;
  finishedCount: number;
  teamCount: number;
}

export function StatsBar({ totalMatches, liveCount, finishedCount, teamCount }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{totalMatches}</span>
        <span className="stat-label">Matches</span>
      </div>
      <div className="stat live">
        <span className="stat-value">{liveCount}</span>
        <span className="stat-label">Live Now</span>
      </div>
      <div className="stat">
        <span className="stat-value">{finishedCount}</span>
        <span className="stat-label">Completed</span>
      </div>
      <div className="stat">
        <span className="stat-value">{teamCount}</span>
        <span className="stat-label">Teams</span>
      </div>
    </div>
  );
}
