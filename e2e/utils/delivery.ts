/**
 * A day the checkout calendar will accept, at local midnight.
 *
 * The picker is limited to today..today+7 and collapses "today" to `orderTime: 0`, so only a
 * strictly future day proves the encoding at all. Two days out keeps a run that straddles
 * midnight away from both edges of that window.
 */
export const scheduledDeliveryDate = (daysFromToday = 2): Date => {
  const date = new Date(new Date().setHours(0, 0, 0, 0))
  date.setDate(date.getDate() + daysFromToday)

  return date
}

/**
 * Unix **seconds**, which is exactly what the `orderTime` Controller stores for a clicked day.
 *
 * A milliseconds regression lands the delivery ~55 000 years out and still passes anything
 * that only checks "is it in the future", which is why the specs compare against this value
 * rather than against a range.
 */
export const orderTimeOf = (date: Date): number => Math.floor(date.getTime() / 1000)
