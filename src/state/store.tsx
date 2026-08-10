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

// Central app state for the shared local instance. A tiny reducer keeps all the
// money rules in one place; everything persists to localStorage automatically.

type KidId = 'sai' | 'leila'

type Action =
  | { type: 'BUY'; kid: KidId; ticker: string; shares: number; note: string }
  | { type: 'SELL'; kid: KidId; ticker: string; shares: number; note: string }
  | { type: 'SET_VIEW_MODE'; kid: KidId; mode: ViewMode }
  | { type: 'TOP_UP'; kid: KidId; amount: number; reason: string }
  | { type: 'RESET' }

function updateKid(state: AppState, id: KidId, fn: (k: KidProfile) => KidProfile): AppState {
  return { ...state, kids: { ...state.kids, [id]: fn(state.kids[id]) } }
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState() ?? makeInitialState())

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
