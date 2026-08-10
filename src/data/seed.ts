import type { AppState, Deposit, KidProfile, Trade } from '../types'
import { ALL_DATES, priceOn } from '../lib/prices'
import { newId } from '../lib/storage'

// A friendly starting scenario so the app has something to show on first run:
// each child already has a little money paid in and a few thoughtful trades,
// dated on real trading days from the price history. Charts, journals and the
// portfolio all have content immediately. The parent can reset to this.
//
// The trades are written as {ticker, monthsAgo, shares} and resolved to actual
// dates + prices below, so they line up with whatever price data is loaded.

interface SeedTrade {
  ticker: string
  monthsAgo: number
  shares: number
  note: string
}

interface SeedKid {
  id: 'sai' | 'leila'
  name: string
  emoji: string
  colour: string
  viewMode: 'simple' | 'detailed'
  allowance: number
  /** Money paid in: [monthsAgo, amount, reason]. */
  deposits: [number, number, string][]
  trades: SeedTrade[]
}

const SEED: SeedKid[] = [
  {
    id: 'sai',
    name: 'Sai',
    emoji: '🦖',
    colour: '#f97316',
    viewMode: 'simple',
    allowance: 5,
    deposits: [
      [6, 50, 'Starting pocket money'],
      [4, 5, 'Weekly allowance'],
      [2, 5, 'Weekly allowance'],
      [1, 10, 'Birthday top-up'],
    ],
    trades: [
      { ticker: 'AAPL', monthsAgo: 5, shares: 0.1, note: 'I use an iPad every day and everyone has an iPhone.' },
      { ticker: 'NTDOY', monthsAgo: 4, shares: 1, note: 'I love my Switch and Mario games.' },
      { ticker: 'DIS', monthsAgo: 2, shares: 0.15, note: 'We watch Disney+ all the time.' },
    ],
  },
  {
    id: 'leila',
    name: 'Leila',
    emoji: '🦩',
    colour: '#ec4899',
    viewMode: 'detailed',
    allowance: 10,
    deposits: [
      [7, 180, 'Starting pocket money'],
      [5, 15, 'Weekly allowance'],
      [3, 15, 'Weekly allowance'],
      [1, 15, 'Weekly allowance'],
    ],
    trades: [
      { ticker: 'SP500', monthsAgo: 6, shares: 0.12, note: 'Owning 500 companies at once feels safer than just one.' },
      { ticker: 'AAPL', monthsAgo: 5, shares: 0.2, note: 'Strong brand and people upgrade their phones a lot.' },
      { ticker: 'INDIA', monthsAgo: 4, shares: 0.6, note: 'India is growing fast and lots of young people.' },
      { ticker: 'NVDA', monthsAgo: 2, shares: 0.3, note: 'AI is everywhere and Nvidia makes the chips for it.' },
      { ticker: 'LULU', monthsAgo: 1, shares: 0.04, note: 'Everyone at school wears their leggings.' },
    ],
  },
]

/** ISO date roughly `monthsAgo` months before the latest price date, snapped
 * to the nearest available trading day in the price history. */
function dateMonthsAgo(monthsAgo: number): string {
  const latest = new Date(ALL_DATES[ALL_DATES.length - 1] + 'T00:00:00Z')
  const target = new Date(latest)
  target.setUTCMonth(target.getUTCMonth() - monthsAgo)
  const iso = target.toISOString().slice(0, 10)
  // Snap to the latest trading day on/after target (fallback: nearest before).
  const after = ALL_DATES.find((d) => d >= iso)
  if (after) return after
  return ALL_DATES[ALL_DATES.length - 1]
}

function buildKid(seed: SeedKid): KidProfile {
  const deposits: Deposit[] = seed.deposits.map(([monthsAgo, amount, reason]) => ({
    id: newId(),
    date: dateMonthsAgo(monthsAgo),
    amount,
    reason,
  }))

  const trades: Trade[] = []
  // Track cash and average cost as we replay, so holdings are consistent.
  let cash = 0
  const holdingMap = new Map<string, { shares: number; cost: number }>()

  // Merge deposits + trades in date order so cash never goes negative.
  const events = [
    ...deposits.map((d) => ({ kind: 'deposit' as const, date: d.date, amount: d.amount })),
    ...seed.trades.map((t) => ({ kind: 'trade' as const, ...t, date: dateMonthsAgo(t.monthsAgo) })),
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  for (const ev of events) {
    if (ev.kind === 'deposit') {
      cash += ev.amount
      continue
    }
    const price = priceOn(ev.ticker, ev.date)
    if (price === undefined) continue
    const spend = price * ev.shares
    if (spend > cash + 1e-9) continue // don't let the seed overspend
    cash -= spend
    trades.push({
      id: newId(),
      date: ev.date,
      ticker: ev.ticker,
      action: 'buy',
      shares: ev.shares,
      price: Math.round(price * 100) / 100,
      note: ev.note,
    })
    const prev = holdingMap.get(ev.ticker) ?? { shares: 0, cost: 0 }
    holdingMap.set(ev.ticker, {
      shares: prev.shares + ev.shares,
      cost: prev.cost + spend,
    })
  }

  const holdings = [...holdingMap.entries()].map(([ticker, { shares, cost }]) => ({
    ticker,
    shares: Math.round(shares * 1e6) / 1e6,
    avgCost: Math.round((cost / shares) * 100) / 100,
  }))

  return {
    id: seed.id,
    name: seed.name,
    emoji: seed.emoji,
    colour: seed.colour,
    cash: Math.round(cash * 100) / 100,
    holdings,
    trades,
    deposits,
    viewMode: seed.viewMode,
    allowance: { amount: seed.allowance, lastPaid: dateMonthsAgo(1) },
  }
}

export function makeInitialState(): AppState {
  return {
    version: 1,
    kids: {
      sai: buildKid(SEED[0]),
      leila: buildKid(SEED[1]),
    },
  }
}
