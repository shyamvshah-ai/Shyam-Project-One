import type { PriceData } from '../types'
import pricesJson from '../data/prices.json'

// The single place the app reads price data. It's a static local file written
// by the price scripts — there are no network calls at runtime.

export const PRICES = pricesJson as PriceData

/** Are we showing real market data, or the shipped placeholder? */
export const PRICES_ARE_REAL = PRICES.real

/** When the price file was generated (ISO string). */
export const PRICES_GENERATED_AT = PRICES.generatedAt

const dateIndex: Record<string, number> = Object.fromEntries(
  PRICES.dates.map((d, i) => [d, i]),
)

/** True if we have any price series for this ticker. */
export function hasPrices(ticker: string): boolean {
  const s = PRICES.series[ticker]
  return Array.isArray(s) && s.length > 0
}

/** Latest price in the asset's own currency (e.g. USD, pence), if we have it. */
export function localPrice(ticker: string): { currency: string; price: number } | undefined {
  return PRICES.local?.[ticker]
}

/** Latest known close price for a ticker (£), or undefined if we have none. */
export function latestPrice(ticker: string): number | undefined {
  const s = PRICES.series[ticker]
  if (!s || s.length === 0) return undefined
  return s[s.length - 1]
}

/**
 * Price for a ticker on (or just before) a given ISO date. If the date isn't a
 * trading day we walk back to the previous available one. Used to reconstruct
 * portfolio value over time from the trade log.
 */
export function priceOn(ticker: string, isoDay: string): number | undefined {
  const s = PRICES.series[ticker]
  if (!s || s.length === 0) return undefined
  let idx = dateIndex[isoDay]
  if (idx === undefined) {
    // Find the latest trading day <= isoDay via a scan (dates are sorted).
    idx = -1
    for (let i = 0; i < PRICES.dates.length; i++) {
      if (PRICES.dates[i] <= isoDay) idx = i
      else break
    }
    if (idx < 0) return s[0] // before our history — use the earliest we have
  }
  return s[idx]
}

/** Price exactly `tradingDaysAgo` trading days before the latest close. */
export function priceDaysAgo(ticker: string, tradingDaysAgo: number): number | undefined {
  const s = PRICES.series[ticker]
  if (!s || s.length === 0) return undefined
  const idx = Math.max(0, s.length - 1 - tradingDaysAgo)
  return s[idx]
}

/**
 * Is the stock market open today? Prices only move on trading days, so on a
 * weekend nothing has changed since Friday's close. (Local time = the family's
 * time. Weekday public holidays are rare and not special-cased.)
 */
export function marketOpenToday(now: Date = new Date()): boolean {
  const day = now.getDay()
  return day !== 0 && day !== 6 // 0 = Sunday, 6 = Saturday
}

/**
 * "Today's" change for a ticker: { change £, pct } vs the previous close. When
 * the market is shut today (the weekend), nothing has moved since the last
 * close, so this is zero for everything — no phantom ups and downs while the
 * exchanges are closed.
 */
export function dailyChange(ticker: string): { change: number; pct: number } {
  if (!marketOpenToday()) return { change: 0, pct: 0 }
  const s = PRICES.series[ticker]
  if (!s || s.length < 2) return { change: 0, pct: 0 }
  const today = s[s.length - 1]
  const prev = s[s.length - 2]
  const change = today - prev
  return { change, pct: prev === 0 ? 0 : change / prev }
}

export interface PricePoint {
  date: string
  price: number
}

/**
 * Price history for a ticker as chart-ready points, limited to the most recent
 * `days` trading days (default: everything).
 */
export function priceHistory(ticker: string, days?: number): PricePoint[] {
  const s = PRICES.series[ticker]
  if (!s) return []
  const start = days ? Math.max(0, s.length - days) : 0
  const out: PricePoint[] = []
  for (let i = start; i < s.length; i++) {
    out.push({ date: PRICES.dates[i], price: s[i] })
  }
  return out
}

export const ALL_DATES = PRICES.dates
export const LATEST_DATE = PRICES.dates[PRICES.dates.length - 1]
