import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
}

const TOP_THRESHOLD = 16;
const MOBILE_QUERY = '(max-width: 768px)';

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  );
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onResize = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onResize);

    const getScrollTop = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let ticking = false;
    const onScroll = () => {
      if (!mq.matches) {
        setVisible(true);
        return;
      }

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setVisible(getScrollTop() <= TOP_THRESHOLD);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      mq.removeEventListener('change', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || !isMobile) {
      setHeaderHeight(0);
      return;
    }

    const updateHeight = () => setHeaderHeight(header.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isMobile, visible, lastUpdated]);

  const collapsed = isMobile && !visible;

  return (
    <>
      {isMobile && (
        <div
          className="header-spacer"
          style={{ height: collapsed ? 0 : headerHeight }}
          aria-hidden="true"
        />
      )}
      <header
        ref={headerRef}
        className={`header ${isMobile ? 'header--mobile' : ''} ${collapsed ? 'header--collapsed' : ''}`}
        aria-hidden={collapsed}
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
    </>
  );
}
