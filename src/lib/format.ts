// Formatting helpers. Everything money-related is in £.

const gbp0 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})
const gbp2 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** £1,234 (no pence) — good for big headline numbers. */
export function money(n: number): string {
  return gbp0.format(n)
}

/** £12.34 (with pence) — good for prices and small amounts. */
export function moneyExact(n: number): string {
  return gbp2.format(n)
}

/** Pick pence-precision for small numbers, whole pounds for big ones. */
export function moneySmart(n: number): string {
  return Math.abs(n) < 100 ? gbp2.format(n) : gbp0.format(n)
}

/** +12.3% / -4.0%, always signed. */
export function percent(fraction: number, digits = 1): string {
  const sign = fraction > 0 ? '+' : ''
  return `${sign}${(fraction * 100).toFixed(digits)}%`
}

/** Signed money, e.g. +£42 or -£17. */
export function moneySigned(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}${moneySmart(Math.abs(n))}`
}

/** Share counts: whole numbers show plainly, fractions to 2 dp. */
export function shares(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/** Friendly date like "10 Aug 2026". */
export function niceDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Shorter date like "10 Aug". */
export function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Month + year like "Aug 2024" — for axes spanning several years. */
export function monthYear(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

/** Format a price in its own local currency, e.g. "$308.20", "475p", "€120.50". */
export function localMoney(currency: string, price: number): string {
  switch (currency) {
    case 'USD':
      return `$${price.toFixed(2)}`
    case 'EUR':
      return `€${price.toFixed(2)}`
    case 'GBP':
      return `£${price.toFixed(2)}`
    case 'GBp':
    case 'GBX':
      return `${Math.round(price)}p`
    case 'JPY':
      return `¥${Math.round(price)}`
    case 'KRW':
      return `₩${Math.round(price).toLocaleString('en-GB')}`
    case 'CHF':
      return `CHF ${price.toFixed(2)}`
    default:
      return `${price.toFixed(2)} ${currency}`
  }
}

/** Direction word for up/down/flat, used with colour cues. */
export function direction(n: number): 'up' | 'down' | 'flat' {
  if (n > 0) return 'up'
  if (n < 0) return 'down'
  return 'flat'
}

/** Today's real calendar date as an ISO string (used for the weekly streak). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** A whole-number week counter, so we can tell consecutive weeks apart. */
export function weekIndex(iso: string): number {
  return Math.floor(new Date(iso + 'T00:00:00Z').getTime() / (7 * 86_400_000))
}

/** Format a Date as a local (not UTC) YYYY-MM-DD, to line up with price dates. */
function isoLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** ISO date of the Monday that begins the current week (local time). */
export function weekStartISO(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dow = d.getDay() // 0 = Sunday .. 6 = Saturday
  const toMonday = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + toMonday)
  return isoLocal(d)
}

/** Shift an ISO date by a number of days, returning a new ISO date. */
export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return isoLocal(d)
}

/** Has the child already checked in during the current calendar week? */
export function isThisWeek(iso: string | null): boolean {
  return iso != null && weekIndex(iso) === weekIndex(todayISO())
}
