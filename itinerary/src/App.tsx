import { useState } from 'react'
import { days, tripMeta } from './data/days'
import { DayExplorer } from './components/DayExplorer'
import { JourneyStrip } from './components/JourneyStrip'
import { TripInfoModal } from './components/TripInfoModal'
import type { DayPlan } from './types'

const regionLabels: Record<DayPlan['region'], string> = {
  travel: 'Transit',
  bali: 'Bali',
  java: 'Java',
  singapore: 'Singapore',
}

const regionWeekRows = [
  { label: 'Week 1', days: days.slice(0, 5) },
  { label: 'Week 2', days: days.slice(5, 12) },
]

function getDayTone(day: DayPlan) {
  const timelineLength = day.timeline.length
  const hasFlight = day.timeline.some((item) => item.type === 'flight')
  const hasTrek = `${day.title} ${day.summary}`.toLowerCase().includes('trek')
  const hasClub = `${day.title} ${day.summary}`.toLowerCase().includes('club')

  if (hasFlight || hasTrek || timelineLength >= 10) return 'Heavy'
  if (hasClub || timelineLength >= 7) return 'Packed'
  return 'Chill'
}

function getDayTags(day: DayPlan) {
  const text = `${day.title} ${day.subtitle} ${day.summary}`.toLowerCase()
  return [
    day.timeline.some((item) => item.type === 'flight') && 'Flight',
    text.includes('trek') && 'Trek',
    text.includes('beach') && 'Beach',
    text.includes('club') && 'Club',
    text.includes('light show') || text.includes('rhapsody') || text.includes('spectra') ? 'Lights' : '',
    day.attractions.length > 0 && `${day.attractions.length} tickets`,
  ].filter(Boolean).slice(0, 3) as string[]
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [tripInfoOpen, setTripInfoOpen] = useState(false)
  const activeDay = days[activeIndex]

  const handlePrint = () => window.print()

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1))
  const goNext = () => setActiveIndex((i) => Math.min(days.length - 1, i + 1))

  return (
    <div className={`app app--${activeDay.region}`}>
      <header className="masthead">
        <div className="masthead__glow masthead__glow--1" />
        <div className="masthead__glow masthead__glow--2" />
        <div className="masthead__inner">
          <div className="masthead__top">
            <div>
              <p className="masthead__eyebrow">Private journey · August 2026</p>
              <h1 className="masthead__title">{tripMeta.title}</h1>
              <p className="masthead__tagline">{tripMeta.subtitle}</p>
            </div>
            <div className="masthead__actions">
              <button type="button" className="btn btn--glass" onClick={() => setTripInfoOpen(true)}>
                Budget & contacts
              </button>
              <button type="button" className="btn btn--glass" onClick={handlePrint}>
                PDF
              </button>
            </div>
          </div>
          <JourneyStrip />
        </div>
      </header>

      <main className="stage">
        <section className="calendar-board" aria-label="Trip calendar">
          <div className="calendar-board__header">
            <div>
              <p className="calendar-board__eyebrow">Trip calendar</p>
              <h2>Pick a day, then drill into the full plan</h2>
            </div>
            <div className="calendar-board__legend" aria-label="Calendar legend">
              <span><i className="legend-dot legend-dot--travel" /> Transit</span>
              <span><i className="legend-dot legend-dot--bali" /> Bali</span>
              <span><i className="legend-dot legend-dot--java" /> Java</span>
              <span><i className="legend-dot legend-dot--singapore" /> Singapore</span>
            </div>
          </div>

          {regionWeekRows.map((row) => (
            <div key={row.label} className="calendar-week">
              <div className="calendar-week__label">{row.label}</div>
              <div className="calendar-grid">
                {row.days.map((day) => {
                  const index = days.findIndex((d) => d.id === day.id)
                  const isActive = index === activeIndex
                  const firstStop = day.timeline[0]
                  const lastStop = day.timeline[day.timeline.length - 1]
                  const tags = getDayTags(day)

                  return (
                    <button
                      key={day.id}
                      type="button"
                      className={`calendar-card calendar-card--${day.region} ${isActive ? 'calendar-card--active' : ''}`}
                      onClick={() => setActiveIndex(index)}
                      aria-pressed={isActive}
                    >
                      <span className="calendar-card__shine" />
                      <span className="calendar-card__top">
                        <span className="calendar-card__date">
                          <strong>{day.date.replace(' 2026', '')}</strong>
                          <small>{day.weekday}</small>
                        </span>
                        <span className="calendar-card__icon">{day.heroIcon}</span>
                      </span>
                      <span className="calendar-card__body">
                        <span className="calendar-card__region">{regionLabels[day.region]}</span>
                        <span className="calendar-card__title">{day.title}</span>
                        <span className="calendar-card__subtitle">{day.subtitle}</span>
                      </span>
                      <span className="calendar-card__route">
                        <span>{firstStop.time} · {firstStop.title}</span>
                        <span>{lastStop.time} · {lastStop.title}</span>
                      </span>
                      <span className="calendar-card__footer">
                        <span>{day.timeline.length} stops</span>
                        <span>{getDayTone(day)}</span>
                      </span>
                      {tags.length > 0 && (
                        <span className="calendar-card__tags">
                          {tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        <div className="stage__nav">
          <button type="button" className="stage__arrow" onClick={goPrev} disabled={activeIndex === 0} aria-label="Previous day">
            ←
          </button>
          <span className="stage__counter">
            Day {activeDay.dayNumber} of {days.length}
          </span>
          <button type="button" className="stage__arrow" onClick={goNext} disabled={activeIndex === days.length - 1} aria-label="Next day">
            →
          </button>
        </div>

        <DayExplorer key={activeDay.id} day={activeDay} />
      </main>

      <TripInfoModal open={tripInfoOpen} onClose={() => setTripInfoOpen(false)} />
    </div>
  )
}
