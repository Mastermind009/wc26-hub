import type { MatchFilter, Team } from '../types';

interface FilterBarProps {
  activeFilter: MatchFilter;
  onFilterChange: (filter: MatchFilter) => void;
  teams: Team[];
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  resultCount: number;
}

const FILTERS: { id: MatchFilter; label: string; desc: string }[] = [
  { id: 'all', label: 'All Matches', desc: 'Full schedule' },
  { id: 'team', label: 'By Team', desc: 'Filter by country' },
  { id: 'ist', label: 'IST Friendly', desc: '9 AM – 3:30 AM IST' },
  { id: 'hot', label: 'Hot Matches', desc: 'Top nations' },
];

export function FilterBar({
  activeFilter,
  onFilterChange,
  teams,
  selectedTeam,
  onTeamChange,
  resultCount,
}: FilterBarProps) {
  return (
    <section className="filter-bar">
      <div className="filter-chips">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => onFilterChange(f.id)}
          >
            <span className="chip-label">{f.label}</span>
            <span className="chip-desc">{f.desc}</span>
          </button>
        ))}
      </div>

      {activeFilter === 'team' && (
        <div className="team-select-wrap">
          <label htmlFor="team-filter">Select team</label>
          <select
            id="team-filter"
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
          >
            <option value="">Choose a country…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.name_en}>
                {t.name_en}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="result-count">
        Showing <strong>{resultCount}</strong> match{resultCount !== 1 ? 'es' : ''}
      </p>
    </section>
  );
}
