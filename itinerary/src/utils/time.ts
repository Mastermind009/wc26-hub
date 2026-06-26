import type { DayPlan } from '../types'

/** Default IANA-style abbreviations per region */
export const regionTimezone: Record<DayPlan['region'], string> = {
  travel: 'Local',
  bali: 'WITA',
  java: 'WIB',
  singapore: 'SGT',
}

/** Format a same-calendar-day stop: "Thu 6 Aug · 09:00 WITA" */
export function formatDayTime(date: string, time: string, tz: string): string {
  const shortDate = date.replace(' 2026', '')
  return `${shortDate} · ${time} ${tz}`
}

export function mealSlotLabel(
  slot: 'breakfast' | 'lunch' | 'dinner',
  custom?: string,
): string {
  return custom ?? slot.charAt(0).toUpperCase() + slot.slice(1)
}

export function timelineDisplay(
  item: { time: string; timeDisplay?: string },
  day: Pick<DayPlan, 'date' | 'timezone'>,
): string {
  if (item.timeDisplay) return item.timeDisplay
  return formatDayTime(day.date, item.time, day.timezone)
}

export function mealTimeDisplay(
  meal: { time: string; timeDisplay?: string },
  day: Pick<DayPlan, 'date' | 'timezone'>,
): string {
  if (meal.timeDisplay) return meal.timeDisplay
  return formatDayTime(day.date, meal.time, day.timezone)
}
