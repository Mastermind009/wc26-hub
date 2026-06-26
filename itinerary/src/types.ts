export interface Meal {
  restaurant: string
  time: string
  /** Full label e.g. "Thu 6 Aug · 03:30 SGT" when crossing dates/timezones */
  timeDisplay?: string
  /** Override "Breakfast" / "Lunch" / "Dinner" */
  slotLabel?: string
  dishes: string[]
  costPerPerson: string
  mapsLink?: string
  bookingLink?: string
  note?: string
}

export interface TransportLeg {
  from: string
  to: string
  mode: string
  duration: string
  cost: string
  note?: string
}

export interface Attraction {
  name: string
  time: string
  duration: string
  entryPrice: string
  booking: string
  photoSpots: string[]
  mapsLink: string
  note?: string
}

export interface TimelineItem {
  time: string
  /** Full label when time alone is ambiguous */
  timeDisplay?: string
  title: string
  detail: string
  transport?: TransportLeg
  type: 'travel' | 'meal' | 'activity' | 'rest' | 'flight'
}

export type DayRegion = 'travel' | 'bali' | 'java' | 'singapore'

export interface DayPlan {
  id: string
  dayNumber: number
  date: string
  weekday: string
  title: string
  subtitle: string
  location: string
  region: DayRegion
  mapQuery: string
  /** Primary timezone for this calendar day, e.g. WITA, SGT */
  timezone: string
  heroIcon: string
  summary: string
  sunrise?: string
  sunset?: string
  weather: string
  packing: string[]
  backupPlan: string
  dailyBudget: string
  totalDistance: string
  mapsRouteLink: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  timeline: TimelineItem[]
  attractions: Attraction[]
  highlights?: string[]
  specialSection?: {
    title: string
    items: { label: string; value: string }[]
  }
}

export interface TripMeta {
  title: string
  subtitle: string
  dates: string
  destinations: string[]
  totalBudgetRange: string
  preparedFor: string
}
