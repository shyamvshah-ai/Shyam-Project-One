import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppState, KidProfile, Trade, ViewMode } from '../types'
import { loadState, saveState, newId } from '../lib/storage'
import { makeInitialState } from '../data/seed'
import { latestPrice, LATEST_DATE } from '../lib/prices'
import { satisfiedBadges } from '../lib/badges'
import { todayISO, weekIndex } from '../lib/format'

// Central app state for the shared local instance. A tiny reducer keeps all the
// money rules in one place; everything persists to localStorage automatically.

type KidId = 'sai' | 'leila'

type Action =
  | { type: 'BUY'; kid: KidId; ticker: string; shares: number; note: string }
  | { type: 'SELL'; kid: KidId; ticker: string; shares: number; note: string }
  | { type: 'SET_VIEW_MODE'; kid: KidId; mode: ViewMode }
  | { type: 'TOP_UP'; kid: KidId; amount: number; reason: string }
  | { type: 'CHECK_IN'; kid: KidId }
  | { type: 'RESET' }

/** Merge any newly-earned badges into a child's collection (never removes). */
function awardBadges(kid: KidProfile): KidProfile {
  const earned = satisfiedBadges(kid)
  let changed = false
  const badges = { ...kid.badges }
  for (const id of earned) {
    if (!badges[id]) {
      badges[id] = { earnedAt: todayISO() }
      changed = true
    }
  }
  return changed ? { ...kid, badges } : kid
}

function updateKid(state: AppState, id: KidId, fn: (k: KidProfile) => KidProfile): AppState {
  // Re-check badges after every change so they're awarded the moment they're met.
  return { ...state, kids: { ...state.kids, [id]: awardBadges(fn(state.kids[id])) } }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'BUY': {
      const price = latestPrice(action.ticker)
      if (price === undefined || action.shares <= 0) return state
      const cost = price * action.shares
      return updateKid(state, action.kid, (k) => {
        if (cost > k.cash + 1e-9) return k // can't afford — UI guards this too
        const existing = k.holdings.find((h) => h.ticker === action.ticker)
        const holdings = existing
          ? k.holdings.map((h) =>
              h.ticker === action.ticker
                ? {
                    ...h,
                    shares: h.shares + action.shares,
                    avgCost:
                      (h.avgCost * h.shares + cost) / (h.shares + action.shares),
                  }
                : h,
            )
          : [...k.holdings, { ticker: action.ticker, shares: action.shares, avgCost: price }]
        const trade: Trade = {
          id: newId(),
          date: LATEST_DATE,
          ticker: action.ticker,
          action: 'buy',
          shares: action.shares,
          price,
          note: action.note.trim(),
        }
        return {
          ...k,
          cash: Math.round((k.cash - cost) * 100) / 100,
          holdings,
          trades: [trade, ...k.trades],
        }
      })
    }

    case 'SELL': {
      const price = latestPrice(action.ticker)
      if (price === undefined || action.shares <= 0) return state
      return updateKid(state, action.kid, (k) => {
        const existing = k.holdings.find((h) => h.ticker === action.ticker)
        if (!existing || action.shares > existing.shares + 1e-9) return k
        const remaining = existing.shares - action.shares
        const holdings =
          remaining <= 1e-9
            ? k.holdings.filter((h) => h.ticker !== action.ticker)
            : k.holdings.map((h) =>
                h.ticker === action.ticker ? { ...h, shares: remaining } : h,
              )
        const proceeds = price * action.shares
        const trade: Trade = {
          id: newId(),
          date: LATEST_DATE,
          ticker: action.ticker,
          action: 'sell',
          shares: action.shares,
          price,
          note: action.note.trim(),
        }
        return {
          ...k,
          cash: Math.round((k.cash + proceeds) * 100) / 100,
          holdings,
          trades: [trade, ...k.trades],
        }
      })
    }

    case 'SET_VIEW_MODE':
      return updateKid(state, action.kid, (k) => ({ ...k, viewMode: action.mode }))

    case 'TOP_UP': {
      if (action.amount <= 0) return state
      return updateKid(state, action.kid, (k) => ({
        ...k,
        cash: Math.round((k.cash + action.amount) * 100) / 100,
        deposits: [
          ...k.deposits,
          { id: newId(), date: LATEST_DATE, amount: action.amount, reason: action.reason },
        ],
        allowance: { ...k.allowance, lastPaid: LATEST_DATE },
      }))
    }

    case 'CHECK_IN': {
      return updateKid(state, action.kid, (k) => {
        const today = todayISO()
        const last = k.streak.lastCheckIn
        if (last === null) return { ...k, streak: { lastCheckIn: today, weeks: 1 } }
        const gap = weekIndex(today) - weekIndex(last)
        if (gap === 0) return k // already checked in this week — no change
        const weeks = gap === 1 ? k.streak.weeks + 1 : 1 // consecutive week vs a lapse
        return { ...k, streak: { lastCheckIn: today, weeks } }
      })
    }

    case 'RESET':
      return makeInitialState()

    default:
      return state
  }
}

interface StoreValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreValue | null>(null)

const CURRENT_VERSION = 2

function initState(): AppState {
  const loaded = loadState()
  // Discard saved data from an older data model so everyone gets the current
  // starting setup (e.g. the £1,000 fresh start) instead of a broken mix.
  if (loaded && loaded.version === CURRENT_VERSION) return loaded
  return makeInitialState()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useKid(id: KidId): KidProfile {
  return useStore().state.kids[id]
}
