import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EnrichedMatch, Team } from '../types';
import { fetchAllPredictions, fetchMyPredictions, submitPredictions, verifyAdminSecret } from '../api/predictions';
import {
  clearAdminSecret,
  getAdminSecret,
  getClientId,
  getDisplayName,
  setAdminSecret,
  setDisplayName,
} from '../lib/clientId';
import { getTeamDisplayName, sortMatchesForDisplay } from '../utils';

interface PredictionsTabProps {
  matches: EnrichedMatch[];
  teams: Team[];
}

type ScoreMap = Record<string, { home: string; away: string }>;

export function PredictionsTab({ matches, teams }: PredictionsTabProps) {
  const clientId = useMemo(() => getClientId(), []);
  const [name, setName] = useState(getDisplayName());
  const [scores, setScores] = useState<ScoreMap>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminSecret, setAdminSecretState] = useState<string | null>(getAdminSecret());
  const [allPredictions, setAllPredictions] = useState<Awaited<ReturnType<typeof fetchAllPredictions>>>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminView, setAdminView] = useState(false);

  const openMatches = useMemo(
    () =>
      sortMatchesForDisplay(
        matches.filter((m) => m.finished !== 'TRUE' && !m.isLive),
      ),
    [matches],
  );

  const loadMine = useCallback(async (predictorName: string) => {
    const trimmed = predictorName.trim();
    if (!trimmed) {
      setScores({});
      setSaved(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const predictions = await fetchMyPredictions(trimmed);
      const nextScores: ScoreMap = {};
      const nextSaved = new Set<string>();
      for (const p of predictions) {
        nextScores[p.matchId] = { home: String(p.homeScore), away: String(p.awayScore) };
        nextSaved.add(p.matchId);
      }
      setScores(nextScores);
      setSaved(nextSaved);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdmin = useCallback(async () => {
    if (!adminSecret) return;
    setAdminLoading(true);
    try {
      const predictions = await fetchAllPredictions(adminSecret);
      setAllPredictions(predictions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin predictions');
      clearAdminSecret();
      setAdminSecretState(null);
      setAdminView(false);
    } finally {
      setAdminLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    const savedName = getDisplayName();
    if (savedName) loadMine(savedName);
    else setLoading(false);
  }, [loadMine]);

  useEffect(() => {
    if (adminView && adminSecret) loadAdmin();
  }, [adminView, adminSecret, loadAdmin]);

  function updateScore(matchId: string, side: 'home' | 'away', value: string) {
    if (!/^\d*$/.test(value)) return;
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        home: side === 'home' ? value : (prev[matchId]?.home ?? ''),
        away: side === 'away' ? value : (prev[matchId]?.away ?? ''),
      },
    }));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Enter your name before saving predictions.');
      return;
    }

    const predictions = openMatches
      .map((m) => {
        const entry = scores[m.id];
        if (!entry || entry.home === '' || entry.away === '') return null;
        return {
          matchId: m.id,
          homeScore: Number(entry.home),
          awayScore: Number(entry.away),
        };
      })
      .filter(Boolean) as Array<{ matchId: string; homeScore: number; awayScore: number }>;

    if (predictions.length === 0) {
      setError('Add at least one score prediction before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      setDisplayName(name);
      const result = await submitPredictions({
        clientId,
        displayName: name.trim(),
        predictions,
      });
      setSaved(new Set(result.map((p) => p.matchId)));
      setMessage(`Saved ${result.length} prediction${result.length === 1 ? '' : 's'} for ${name.trim()}.`);
      await loadMine(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save predictions');
    } finally {
      setSaving(false);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    const ok = await verifyAdminSecret(adminInput);
    if (!ok) {
      setError('Invalid admin secret.');
      return;
    }
    setAdminSecret(adminInput);
    setAdminSecretState(adminInput);
    setShowAdminLogin(false);
    setAdminInput('');
    setAdminView(true);
    setError(null);
  }

  function handleAdminLogout() {
    clearAdminSecret();
    setAdminSecretState(null);
    setAdminView(false);
    setAllPredictions([]);
  }

  const matchMap = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);

  return (
    <section className="predictions-section">
      <div className="predictions-header">
        <div>
          <h2>Predictions</h2>
          <p>
            Predict scores for upcoming matches. Each name keeps its own picks — friends can
            all predict from the same phone without overwriting each other.
          </p>
        </div>
        <div className="predictions-actions">
          {adminSecret ? (
            <>
              <button
                className={`tab-btn small ${!adminView ? 'active' : ''}`}
                onClick={() => setAdminView(false)}
              >
                My picks
              </button>
              <button
                className={`tab-btn small ${adminView ? 'active' : ''}`}
                onClick={() => setAdminView(true)}
              >
                All picks (Admin)
              </button>
              <button className="refresh-btn" onClick={handleAdminLogout}>
                Admin logout
              </button>
            </>
          ) : (
            <button className="refresh-btn" onClick={() => setShowAdminLogin(true)}>
              Admin
            </button>
          )}
        </div>
      </div>

      {showAdminLogin && (
        <form className="admin-login" onSubmit={handleAdminLogin}>
          <label htmlFor="admin-secret">Admin secret</label>
          <input
            id="admin-secret"
            type="password"
            value={adminInput}
            onChange={(e) => setAdminInput(e.target.value)}
            placeholder="Enter admin secret"
          />
          <button type="submit" className="refresh-btn">Unlock</button>
          <button type="button" className="refresh-btn ghost" onClick={() => setShowAdminLogin(false)}>
            Cancel
          </button>
        </form>
      )}

      {error && <p className="state-msg error inline-msg">{error}</p>}
      {message && <p className="state-msg inline-msg success-msg">{message}</p>}

      {adminView && adminSecret ? (
        <AdminPredictionsView
          predictions={allPredictions}
          matches={matchMap}
          teams={teams}
          loading={adminLoading}
          onRefresh={loadAdmin}
        />
      ) : (
        <>
          <div className="predictor-profile">
            <label htmlFor="predictor-name">Your name</label>
            <input
              id="predictor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim()) loadMine(name.trim());
              }}
              placeholder="How should we label your predictions?"
            />
          </div>

          {loading ? (
            <p className="state-msg">Loading your predictions…</p>
          ) : openMatches.length === 0 ? (
            <p className="state-msg">No open matches left to predict.</p>
          ) : (
            <div className="prediction-list">
              {openMatches.map((match) => {
                const home = getTeamDisplayName(match, 'home');
                const away = getTeamDisplayName(match, 'away');
                const entry = scores[match.id] ?? { home: '', away: '' };
                const isSaved = saved.has(match.id);

                return (
                  <article key={match.id} className="prediction-card">
                    <div className="prediction-meta">
                      <span>Match {match.id}</span>
                      <span>{match.kickoffIstLabel}</span>
                      {isSaved && <span className="saved-badge">Saved</span>}
                    </div>
                    <div className="prediction-teams">
                      <span>{home}</span>
                      <div className="prediction-inputs">
                        <input
                          aria-label={`${home} score`}
                          value={entry.home}
                          onChange={(e) => updateScore(match.id, 'home', e.target.value)}
                          placeholder="0"
                        />
                        <span>-</span>
                        <input
                          aria-label={`${away} score`}
                          value={entry.away}
                          onChange={(e) => updateScore(match.id, 'away', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <span>{away}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <button className="save-predictions-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save predictions'}
          </button>
        </>
      )}
    </section>
  );
}

function AdminPredictionsView({
  predictions,
  matches,
  teams,
  loading,
  onRefresh,
}: {
  predictions: Awaited<ReturnType<typeof fetchAllPredictions>>;
  matches: Map<string, EnrichedMatch>;
  teams: Team[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof predictions>();
    for (const p of predictions) {
      const key = p.displayName.trim().toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    return [...map.entries()]
      .sort((a, b) => a[1][0].displayName.localeCompare(b[1][0].displayName))
      .map(([key, items]) => {
        const sortedItems = [...items].sort((a, b) => {
          const matchA = matches.get(a.matchId);
          const matchB = matches.get(b.matchId);
          const timeA = matchA?.kickoffIst.getTime() ?? Number(a.matchId);
          const timeB = matchB?.kickoffIst.getTime() ?? Number(b.matchId);
          return timeA - timeB;
        });
        return [key, sortedItems] as const;
      });
  }, [predictions, matches]);

  function teamFlag(name: string) {
    return teams.find((t) => t.name_en === name)?.flag ?? '';
  }

  return (
    <div className="admin-predictions">
      <div className="admin-toolbar">
        <p>
          <strong>{predictions.length}</strong> total predictions from{' '}
          <strong>{grouped.length}</strong> people
        </p>
        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="state-msg">Loading all predictions…</p>
      ) : predictions.length === 0 ? (
        <p className="state-msg">No predictions submitted yet.</p>
      ) : (
        grouped.map(([key, items]) => {
          const displayName = items[0].displayName;
          return (
            <div key={key} className="admin-user-block">
              <h3>{displayName}</h3>
              <p className="admin-user-meta">{items.length} predictions</p>
              <div className="admin-prediction-rows">
                {items.map((p) => {
                  const match = matches.get(p.matchId);
                  const home = match ? getTeamDisplayName(match, 'home') : 'TBD';
                  const away = match ? getTeamDisplayName(match, 'away') : 'TBD';
                  return (
                    <div key={`${p.clientId}-${p.matchId}`} className="admin-prediction-row">
                      <span>Match {p.matchId}</span>
                      <span className="admin-match-teams">
                        {teamFlag(match?.home_team_name_en ?? '') && (
                          <img src={teamFlag(match?.home_team_name_en ?? '')} alt="" />
                        )}
                        {home} {p.homeScore}-{p.awayScore} {away}
                        {teamFlag(match?.away_team_name_en ?? '') && (
                          <img src={teamFlag(match?.away_team_name_en ?? '')} alt="" />
                        )}
                      </span>
                      <span className="admin-updated">
                        {new Date(p.updatedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
