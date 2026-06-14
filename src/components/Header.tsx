interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-block">
          <div className="brand">
            <span className="brand-icon">⚽</span>
            <div>
              <span className="eyebrow">Live tournament command center</span>
              <h1>WC26 Hub</h1>
              <p>FIFA World Cup 2026 - USA · Mexico · Canada</p>
            </div>
          </div>
          <p className="hero-copy">
            Track every fixture, India-friendly kickoffs, hot clashes, and player cards from one
            stadium-style dashboard.
          </p>
        </div>
        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className="refresh-btn" onClick={onRefresh} aria-label="Refresh data">
            ↻ Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
