import type { Attraction } from '../types'

interface Props {
  attraction: Attraction
}

export function AttractionCard({ attraction }: Props) {
  return (
    <article className="attraction-card">
      <div className="attraction-card__top">
        <h4>{attraction.name}</h4>
        <span className="attraction-card__time">{attraction.time} · {attraction.duration}</span>
      </div>
      <div className="attraction-card__meta">
        <span><strong>Entry:</strong> {attraction.entryPrice}</span>
        <span><strong>Booking:</strong> {attraction.booking}</span>
      </div>
      {attraction.note && <p className="attraction-card__note">{attraction.note}</p>}
      <div className="attraction-card__photos">
        <strong>Photo spots:</strong>
        <ul>
          {attraction.photoSpots.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <a className="attraction-card__map" href={attraction.mapsLink} target="_blank" rel="noopener noreferrer">
        Open in Google Maps →
      </a>
    </article>
  )
}
