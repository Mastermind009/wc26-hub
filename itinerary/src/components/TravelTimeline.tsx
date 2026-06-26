import type { TimelineItem, DayPlan } from '../types'
import { timelineDisplay } from '../utils/time'

const typeIcons: Record<TimelineItem['type'], string> = {
  travel: '🚗',
  meal: '🍽',
  activity: '📍',
  rest: '😴',
  flight: '✈',
}

interface Props {
  items: TimelineItem[]
  day: Pick<DayPlan, 'date' | 'timezone'>
}

export function TravelTimeline({ items, day }: Props) {
  return (
    <ol className="timeline">
      {items.map((item, i) => (
        <li key={`${item.time}-${i}`} className={`timeline__item timeline__item--${item.type}`}>
          <div className="timeline__marker">
            <span className="timeline__icon">{typeIcons[item.type]}</span>
          </div>
          <div className="timeline__content">
            <time className="timeline__time">{timelineDisplay(item, day)}</time>
            <h4 className="timeline__title">{item.title}</h4>
            <p className="timeline__detail">{item.detail}</p>
            {item.transport && (
              <div className="timeline__transport">
                <span className="timeline__transport-route">
                  {item.transport.from} → {item.transport.to}
                </span>
                <span className="timeline__transport-meta">
                  {item.transport.mode} · {item.transport.duration} · {item.transport.cost}
                </span>
                {item.transport.note && <span className="timeline__transport-note">{item.transport.note}</span>}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
