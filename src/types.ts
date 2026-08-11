// Core domain types for the Kids' Investing Dashboard.
// Everything is virtual money — there is no real brokerage anywhere in here.

export type AssetKind = 'stock' | 'etf'

/** A single tradable thing in the curated universe. */
export interface Asset {
  /** Short internal ticker used everywhere in the app + price data keys. */
  ticker: string
  /** Real-world market symbol used by the price-refresh script (e.g. "aapl.us"). */
  source: string
  name: string
  kind: AssetKind
  /** Broad sector, kid-friendly wording (e.g. "Technology", "Toys & Games"). */
  sector: string
  /** Where the company/theme is mostly based (e.g. "USA", "UK", "India"). */
  geography: string
  /** Plain-English "what it does / why it exists" — one or two friendly sentences. */
  blurb: string
  /** Emoji used as a lightweight, kid-friendly logo. */
  emoji: string
  /**
   * Approximate recent price in £. Anchors the shipped placeholder price
   * series and is a sanity fallback for the refresh script. Real prices from
   * `npm run refresh-prices` replace the generated series entirely.
   */
  seedPrice: number
  /** Extra detail shown only in Leila's "detailed" view. All optional. */
  detail?: {
    peRatio?: number
    /** Market cap in billions of £ (virtual, rounded — for teaching scale). */
    marketCapB?: number
    dividendYield?: number
    /** Year-on-year revenue growth, as a fraction (0.12 = 12%). */
    revenueGrowth?: number
  }
}

/** Daily close prices keyed by ticker. Written by scripts/refresh-prices.mjs. */
export interface PriceData {
  /** ISO date this snapshot was generated. */
  generatedAt: string
  /** True when values are real market data; false for the shipped placeholder. */
  real: boolean
  currency: 'GBP'
  /** Shared, ascending list of ISO dates that every series lines up against. */
  dates: string[]
  /** ticker -> close price per date (same length/order as `dates`). */
  series: Record<string, number[]>
}

export type TradeAction = 'buy' | 'sell'

/** One entry in a child's trade journal. */
export interface Trade {
  id: string
  date: string // ISO date
  ticker: string
  action: TradeAction
  shares: number
  /** Price per share at the time of the trade (£). */
  price: number
  /** The required one-line "why I'm buying/selling this" note. */
  note: string
}

/**
 * Virtual money paid into a child's account (the starting grant and each
 * allowance top-up). Kept as a log so we can honestly chart "money paid in"
 * against "what it's worth now", and reconstruct value over time.
 */
export interface Deposit {
  id: string
  date: string // ISO date
  amount: number
  reason: string
}

/** A current position. avgCost tracks the average buy price for gain/loss. */
export interface Holding {
  ticker: string
  shares: number
  avgCost: number
}

export type ViewMode = 'simple' | 'detailed'

/** When a badge was first earned. Badges are permanent once earned. */
export interface BadgeState {
  earnedAt: string // ISO date
}

/** Weekly "checked in this week" streak — rewards patience, not day-trading. */
export interface Streak {
  /** ISO date of the most recent check-in, or null if never. */
  lastCheckIn: string | null
  /** How many weeks in a row they've checked in. */
  weeks: number
}

/** A child's account. */
export interface KidProfile {
  id: 'sai' | 'leila'
  name: string
  emoji: string
  colour: string
  /** Uninvested virtual cash (£). */
  cash: number
  holdings: Holding[]
  trades: Trade[]
  deposits: Deposit[]
  viewMode: ViewMode
  /** Earned badges, keyed by badge id. Once earned, never removed. */
  badges: Record<string, BadgeState>
  /** Weekly check-in streak. */
  streak: Streak
  /** Weekly virtual allowance settings (paid in by the parent). */
  allowance: {
    amount: number
    /** ISO date allowance was last topped up. */
    lastPaid: string
  }
}

/** Full persisted app state. */
export interface AppState {
  version: number
  kids: Record<'sai' | 'leila', KidProfile>
}

export type ProfileId = 'sai' | 'leila' | 'parent'
