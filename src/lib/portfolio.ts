import type { Holding, KidProfile } from '../types'
import { ALL_DATES, dailyChange, latestPrice, priceOn } from './prices'

// All the money maths in one place. Everything is virtual £.

export interface HoldingView {
  ticker: string
  shares: number
  avgCost: number
  price: number
  /** Current market value of the position (£). */
  value: number
  /** What it cost to buy the shares still held (£). */
  cost: number
  /** value - cost (£). */
  gain: number
  /** gain / cost (fraction). */
  gainPct: number
  /** Today's £ move for this position vs yesterday's close. */
  dayChange: number
  dayChangePct: number
}

/** Build a display-ready view of one holding at the latest price. */
export function holdingView(h: Holding): HoldingView | null {
  const price = latestPrice(h.ticker)
  if (price === undefined) return null
  const value = price * h.shares
  const cost = h.avgCost * h.shares
  const gain = value - cost
  const day = dailyChange(h.ticker)
  return {
    ticker: h.ticker,
    shares: h.shares,
    avgCost: h.avgCost,
    price,
    value,
    cost,
    gain,
    gainPct: cost === 0 ? 0 : gain / cost,
    dayChange: day.change * h.shares,
    dayChangePct: day.pct,
  }
}

export interface PortfolioSummary {
  cash: number
  holdingsValue: number
  /** cash + holdingsValue — the child's total worth. */
  totalValue: number
  /** Total virtual money ever paid in (grants + allowance). */
  totalDeposited: number
  /** totalValue - totalDeposited — growth on money paid in (£). */
  totalGain: number
  totalGainPct: number
  /** Today's £ move across all holdings. */
  dayChange: number
  /** Cost basis + unrealised gain across held positions (for the detailed view). */
  investedCost: number
  investedGain: number
  holdings: HoldingView[]
}

export function portfolioSummary(kid: KidProfile): PortfolioSummary {
  const holdings = kid.holdings
    .map(holdingView)
    .filter((h): h is HoldingView => h !== null)

  const holdingsValue = holdings.reduce((s, h) => s + h.value, 0)
  const investedCost = holdings.reduce((s, h) => s + h.cost, 0)
  const investedGain = holdings.reduce((s, h) => s + h.gain, 0)
  const dayChange = holdings.reduce((s, h) => s + h.dayChange, 0)
  const totalDeposited = kid.deposits.reduce((s, d) => s + d.amount, 0)
  const totalValue = kid.cash + holdingsValue
  const totalGain = totalValue - totalDeposited

  return {
    cash: kid.cash,
    holdingsValue,
    totalValue,
    totalDeposited,
    totalGain,
    totalGainPct: totalDeposited === 0 ? 0 : totalGain / totalDeposited,
    dayChange,
    investedCost,
    investedGain,
    holdings,
  }
}

export interface ValuePoint {
  date: string
  /** Total worth (cash + holdings) on that day. */
  value: number
  /** Money paid in by that day — the "you put in" baseline line. */
  deposited: number
}

/**
 * Reconstruct total portfolio worth over time from the deposit + trade logs,
 * marking held shares to market on each trading day. Returns points from the
 * first bit of activity up to the latest price date.
 */
export function valueHistory(kid: KidProfile): ValuePoint[] {
  type Ev = { date: string; cash: number; ticker?: string; shareDelta?: number; deposit?: number }
  const events: Ev[] = []
  for (const d of kid.deposits) events.push({ date: d.date, cash: d.amount, deposit: d.amount })
  for (const t of kid.trades) {
    const cashDelta = t.action === 'buy' ? -t.price * t.shares : t.price * t.shares
    const shareDelta = t.action === 'buy' ? t.shares : -t.shares
    events.push({ date: t.date, cash: cashDelta, ticker: t.ticker, shareDelta })
  }
  if (events.length === 0) return []
  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const firstDate = events[0].date
  const startIdx = Math.max(
    0,
    ALL_DATES.findIndex((d) => d >= firstDate),
  )

  const sharesByTicker: Record<string, number> = {}
  let cash = 0
  let deposited = 0
  let ei = 0
  const out: ValuePoint[] = []

  for (let i = startIdx; i < ALL_DATES.length; i++) {
    const day = ALL_DATES[i]
    while (ei < events.length && events[ei].date <= day) {
      const e = events[ei]
      cash += e.cash
      if (e.deposit) deposited += e.deposit
      if (e.ticker && e.shareDelta) {
        sharesByTicker[e.ticker] = (sharesByTicker[e.ticker] ?? 0) + e.shareDelta
      }
      ei++
    }
    let holdingsValue = 0
    for (const [ticker, sh] of Object.entries(sharesByTicker)) {
      if (sh <= 0) continue
      const p = priceOn(ticker, day)
      if (p !== undefined) holdingsValue += p * sh
    }
    out.push({ date: day, value: cash + holdingsValue, deposited })
  }
  return out
}
