import type { Meal, DayPlan } from '../types'
import { mealTimeDisplay } from '../utils/time'

interface Props {
  label: string
  meal: Meal
  day: Pick<DayPlan, 'date' | 'timezone'>
}

export function RestaurantCard({ label, meal, day }: Props) {
  return (
    <article className="restaurant-card">
      <div className="restaurant-card__header">
        <span className="restaurant-card__label">{label}</span>
        <time className="restaurant-card__time">{mealTimeDisplay(meal, day)}</time>
      </div>
      <h4 className="restaurant-card__name">{meal.restaurant}</h4>
      <ul className="restaurant-card__dishes">
        {meal.dishes.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <p className="restaurant-card__cost">{meal.costPerPerson} / person</p>
      {meal.note && <p className="restaurant-card__note">{meal.note}</p>}
      <div className="restaurant-card__links">
        {meal.mapsLink && (
          <a href={meal.mapsLink} target="_blank" rel="noopener noreferrer">
            Maps
          </a>
        )}
        {meal.bookingLink && (
          <a href={meal.bookingLink} target="_blank" rel="noopener noreferrer">
            Book
          </a>
        )}
      </div>
    </article>
  )
}
