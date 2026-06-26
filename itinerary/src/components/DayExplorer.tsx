import type { DayPlan } from '../types'
import { mapsEmbedUrl } from '../utils/maps'
import { ExpandableSection } from './ExpandableSection'
import { RestaurantCard } from './RestaurantCard'
import { AttractionCard } from './AttractionCard'
import { TravelTimeline } from './TravelTimeline'
import { mealSlotLabel } from '../utils/time'

interface Props {
  day: DayPlan
}

const regionLabels: Record<DayPlan['region'], string> = {
  travel: 'In transit',
  bali: 'Bali',
  java: 'East Java',
  singapore: 'Singapore',
}

export function DayExplorer({ day }: Props) {
  const mapSrc = mapsEmbedUrl(day.mapQuery, day.region === 'travel' ? 4 : 12)

  return (
    <div className={`day-explorer day-explorer--${day.region}`}>
      <header className="day-explorer__bar">
        <div className="day-explorer__bar-main">
          <span className="day-explorer__bar-icon">{day.heroIcon}</span>
          <div>
            <p className="day-explorer__bar-kicker">
              Day {day.dayNumber} · {day.weekday} · {day.date}
            </p>
            <h2 className="day-explorer__bar-title">{day.title}</h2>
            <p className="day-explorer__bar-loc">{day.location}</p>
          </div>
        </div>
        <div className="day-explorer__bar-chips">
          <span className="chip">{regionLabels[day.region]}</span>
          <span className="chip">{day.dailyBudget}</span>
          {day.sunset && <span className="chip">Sunset {day.sunset}</span>}
        </div>
        <a
          className="day-explorer__maps-link"
          href={day.mapsRouteLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open route ↗
        </a>
      </header>

      {day.id === 'day-8' && (
        <div className="flight-route flight-route--compact">
          <div className="flight-route__leg">
            <span>12 Aug · Batu</span>
            <span className="flight-route__plane">🚗</span>
            <span>Surabaya SUB</span>
          </div>
          <p className="flight-route__layover">~3.5 hr drive — skip Bali entirely</p>
          <div className="flight-route__leg">
            <span>12 Aug · SUB</span>
            <span className="flight-route__plane">✈</span>
            <span>12 Aug · Singapore</span>
          </div>
        </div>
      )}

      {day.id === 'day-1' && (
        <div className="flight-route flight-route--compact">
          <div className="flight-route__leg">
            <span>Wed 5 Aug · India</span>
            <span className="flight-route__plane">✈</span>
            <span>Thu 6 Aug · Changi</span>
          </div>
          <p className="flight-route__layover">3.5–4 hr layover (02:30–06:30 SGT)</p>
          <div className="flight-route__leg">
            <span>Thu 6 Aug · Changi</span>
            <span className="flight-route__plane">✈</span>
            <span>Thu 6 Aug · Bali</span>
          </div>
        </div>
      )}

      <div className="day-explorer__map-wrap">
        <iframe
          title={`Map — ${day.title}`}
          className="day-explorer__map"
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="day-explorer__drawer">
        <ExpandableSection
          title="Minute-by-minute timeline"
          icon="🕐"
          badge={`${day.timeline.length} stops`}
          defaultOpen
        >
          <TravelTimeline items={day.timeline} day={day} />
        </ExpandableSection>

        <ExpandableSection title="Dining & dishes" icon="🍽" badge="3 meals">
          <div className="restaurant-grid">
            <RestaurantCard label={mealSlotLabel('breakfast', day.breakfast.slotLabel)} meal={day.breakfast} day={day} />
            <RestaurantCard label={mealSlotLabel('lunch', day.lunch.slotLabel)} meal={day.lunch} day={day} />
            <RestaurantCard label={mealSlotLabel('dinner', day.dinner.slotLabel)} meal={day.dinner} day={day} />
          </div>
        </ExpandableSection>

        {day.attractions.length > 0 && (
          <ExpandableSection title="Attractions & tickets" icon="📍" badge={`${day.attractions.length} places`}>
            <div className="attraction-grid">
              {day.attractions.map((a) => (
                <AttractionCard key={a.name} attraction={a} />
              ))}
            </div>
          </ExpandableSection>
        )}

        {day.specialSection && (
          <ExpandableSection title={day.specialSection.title} icon="⭐">
            <dl className="special-dl">
              {day.specialSection.items.map((item) => (
                <div key={item.label} className="special-dl__row">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </ExpandableSection>
        )}

        <ExpandableSection title="Weather, packing & rain plan" icon="🎒">
          <div className="info-grid">
            <div className="info-box">
              <h3>Weather</h3>
              <p>{day.weather}</p>
            </div>
            <div className="info-box">
              <h3>Backup if it rains</h3>
              <p>{day.backupPlan}</p>
            </div>
            <div className="info-box info-box--pack">
              <h3>Packing for today</h3>
              <ul>
                {day.packing.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </ExpandableSection>

        {day.highlights && day.highlights.length > 0 && (
          <ExpandableSection title="Important notes" icon="💡">
            <ul className="highlights-list">
              {day.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </ExpandableSection>
        )}
      </div>
    </div>
  )
}
