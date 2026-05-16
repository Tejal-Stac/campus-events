/**
 * getEventStatus – single source of truth for event time-state.
 *
 * @param {string|Date|null} startDate  – event start datetime
 * @param {string|Date|null} endDate    – event end datetime (optional)
 * @param {boolean}          isClosed   – manually closed by organiser
 * @returns {'live'|'upcoming'|'past'}
 */
export function getEventStatus(startDate, endDate, isClosed = false) {
  const now = new Date()

  // Manually closed or end time already passed → past
  if (isClosed) return 'past'
  if (endDate && now > new Date(endDate)) return 'past'

  // No start date → treat as upcoming (graceful fallback)
  if (!startDate) return 'upcoming'

  const start = new Date(startDate)

  // Hasn't started yet
  if (now < start) return 'upcoming'

  // Started and either no end date or end hasn't passed → live
  return 'live'
}

/**
 * groupEventsByStatus – splits an event array into { live, upcoming, past }.
 *
 * Events use start_date / end_date when available, falling back to the
 * legacy `date` field so older records still render correctly.
 *
 * @param {Array} events
 * @returns {{ live: Array, upcoming: Array, past: Array }}
 */
export function groupEventsByStatus(events = []) {
  const groups = { live: [], upcoming: [], past: [] }

  for (const e of events) {
    const start = e.start_date || e.event_date || e.date || null
    const end   = e.end_date   || null
    const closed = !!e.is_closed

    const status = getEventStatus(start, end, closed)
    groups[status].push(e)
  }

  return groups
}

/** Human-readable date+time from a datetime string */
export function formatEventDate(dt) {
  if (!dt) return 'TBA'
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
