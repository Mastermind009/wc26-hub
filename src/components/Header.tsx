import { useEffect, useState } from 'react';

interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
}

const TOP_THRESHOLD = 12;

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 640px)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const onResize = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onResize);

    let ticking = false;
    const onScroll = () => {
      if (!mq.matches) {
        setVisible(true);
        return;
      }

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setVisible(window.scrollY <= TOP_THRESHOLD);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      mq.removeEventListener('change', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      className={`header ${isMobile && !visible ? 'header--collapsed' : ''}`}
      aria-hidden={isMobile && !visible}
    >
      <div className="header-inner">
        <div className="brand-block">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">
              ⚽
            </span>
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
