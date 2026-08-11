import type { KidProfile } from '../types'
import { getAsset } from '../data/universe'
import { holdingView } from './portfolio'
import { LATEST_DATE } from './prices'

// Badges reward good habits — starting, spreading out, being patient — not
// frequent trading. Each badge is a small goal a child can aim for.

export interface BadgeDef {
  id: string
  emoji: string
  name: string
  /** How to earn it, in kid-friendly words. */
  how: string
  /** True when the child currently satisfies the badge. */
  test: (kid: KidProfile) => boolean
}

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)

/** Number of distinct sectors across a child's current holdings. */
export function sectorCount(kid: KidProfile): number {
  const sectors = new Set<string>()
  for (const h of kid.holdings) {
    const a = getAsset(h.ticker)
    if (a) sectors.add(a.sector)
  }
  return sectors.size
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-trade',
    emoji: '🌱',
    name: 'First Trade',
    how: 'Make your very first investment.',
    test: (k) => k.trades.some((t) => t.action === 'buy'),
  },
  {
    id: 'basket-buyer',
    emoji: '🧺',
    name: 'Basket Buyer',
    how: 'Own a fund that holds lots of companies (an ETF).',
    test: (k) => k.holdings.some((h) => getAsset(h.ticker)?.kind === 'etf'),
  },
  {
    id: 'three-sectors',
    emoji: '🌍',
    name: 'Well Spread',
    how: 'Own things from 3 different sectors at once.',
    test: (k) => sectorCount(k) >= 3,
  },
  {
    id: 'note-taker',
    emoji: '📔',
    name: 'Thoughtful Trader',
    how: 'Write a reason for 5 different trades.',
    test: (k) => k.trades.filter((t) => t.note.trim().length >= 3).length >= 5,
  },
  {
    id: 'in-the-green',
    emoji: '📈',
    name: 'In the Green',
    how: 'Have an investment that has grown in value.',
    test: (k) => k.holdings.some((h) => (holdingView(h)?.gain ?? 0) > 0),
  },
  {
    id: 'income-picker',
    emoji: '💷',
    name: 'Income Picker',
    how: 'Own something that pays dividends (shares its profits).',
    test: (k) =>
      k.holdings.some((h) => (getAsset(h.ticker)?.detail?.dividendYield ?? 0) > 0),
  },
  {
    id: 'grower',
    emoji: '🚀',
    name: 'Growing Up',
    how: 'Grow your total money 10% above what was paid in.',
    test: (k) => {
      const deposited = k.deposits.reduce((s, d) => s + d.amount, 0)
      const holdingsValue = k.holdings.reduce((s, h) => s + (holdingView(h)?.value ?? 0), 0)
      return deposited > 0 && k.cash + holdingsValue >= deposited * 1.1
    },
  },
  {
    id: 'patient',
    emoji: '🐢',
    name: 'Patient Investor',
    how: 'Check in 4 weeks in a row (no need to trade).',
    test: (k) => k.streak.weeks >= 4,
  },
  {
    id: 'year-holder',
    emoji: '🕰️',
    name: 'Long-Term Thinker',
    how: 'Hold the same investment for a whole year.',
    test: (k) => {
      // Earliest buy date per ticker still held today.
      const held = new Set(k.holdings.map((h) => h.ticker))
      const firstBuy: Record<string, string> = {}
      for (const t of k.trades) {
        if (t.action === 'buy' && held.has(t.ticker)) {
          if (!firstBuy[t.ticker] || t.date < firstBuy[t.ticker]) firstBuy[t.ticker] = t.date
        }
      }
      return Object.values(firstBuy).some((d) => daysBetween(d, LATEST_DATE) >= 365)
    },
  },
]

/** Ids of every badge the child currently satisfies. */
export function satisfiedBadges(kid: KidProfile): string[] {
  return BADGES.filter((b) => b.test(kid)).map((b) => b.id)
}
