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

/** Has the child already checked in during the current calendar week? */
export function isThisWeek(iso: string | null): boolean {
  return iso != null && weekIndex(iso) === weekIndex(todayISO())
}
