import { days } from '../data/days'

const stops = [
  { label: 'India', icon: '🇮🇳' },
  { label: 'Changi', icon: '✈' },
  { label: 'Bali', icon: '🌴' },
  { label: 'Butak', icon: '⛰' },
  { label: 'Singapore', icon: '🦁' },
  { label: 'India', icon: '🏠' },
]

export function JourneyStrip() {
  return (
    <div className="journey-strip" aria-hidden="true">
      {stops.map((stop, i) => (
        <span key={`${stop.label}-${i}`} className="journey-strip__segment">
          <span className="journey-strip__stop">
            <span className="journey-strip__icon">{stop.icon}</span>
            {stop.label}
          </span>
          {i < stops.length - 1 && <span className="journey-strip__line" />}
        </span>
      ))}
      <span className="journey-strip__days">{days.length} days · Aug 2026</span>
    </div>
  )
}
