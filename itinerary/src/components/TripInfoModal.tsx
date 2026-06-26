import { budgetSummary, emergencyContacts, tripMeta } from '../data/days'

interface Props {
  open: boolean
  onClose: () => void
}

export function TripInfoModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-labelledby="trip-info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <h2 id="trip-info-title">Trip reference</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="modal__intro">
          {tripMeta.dates} · {tripMeta.totalBudgetRange}
        </p>

        <section className="modal__section">
          <h3>Budget overview</h3>
          <div className="budget-grid">
            <div className="budget-card">
              <h4>Bali (Days 1–9)</h4>
              <p className="budget-card__range">{budgetSummary.bali.low} – {budgetSummary.bali.high}</p>
              <p className="budget-card__note">{budgetSummary.bali.note}</p>
            </div>
            <div className="budget-card">
              <h4>Mount Butak + transfers</h4>
              <p className="budget-card__range">{budgetSummary.trek.low} – {budgetSummary.trek.high}</p>
              <p className="budget-card__note">{budgetSummary.trek.note}</p>
            </div>
            <div className="budget-card">
              <h4>Singapore</h4>
              <p className="budget-card__range">{budgetSummary.singapore.low} – {budgetSummary.singapore.high}</p>
              <p className="budget-card__note">{budgetSummary.singapore.note}</p>
            </div>
            <div className="budget-card">
              <h4>Flights (est.)</h4>
              <p className="budget-card__range">{budgetSummary.flights.low} – {budgetSummary.flights.high}</p>
              <p className="budget-card__note">{budgetSummary.flights.note}</p>
            </div>
          </div>
        </section>

        <section className="modal__section">
          <h3>Emergency & booking contacts</h3>
          <dl className="emergency__list">
            {emergencyContacts.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
