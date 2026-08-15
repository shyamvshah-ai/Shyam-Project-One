import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AppState, KidProfile, Trade, ViewMode } from '../types'
import {
  loadState,
  saveState,
  newId,
  loadFamilyCode,
  saveFamilyCode,
  clearFamilyCode,
} from '../lib/storage'
import { makeInitialState } from '../data/seed'
import { getLocks } from '../lib/locks'
import { latestPrice, LATEST_DATE } from '../lib/prices'
import { satisfiedBadges } from '../lib/badges'
import { todayISO, weekIndex } from '../lib/format'
import { SYNC_ENABLED } from '../lib/syncConfig'
import { getRemote, putRemote } from './sync'

// Central app state for the shared local instance. A tiny reducer keeps all the
// money rules in one place; everything persists to localStorage automatically.

type KidId = 'sai' | 'leila'

type Action =
  | { type: 'BUY'; kid: KidId; ticker: string; shares: number; note: string }
  | { type: 'SELL'; kid: KidId; ticker: string; shares: number; note: string }
  | { type: 'SET_VIEW_MODE'; kid: KidId; mode: ViewMode }
  | { type: 'TOP_UP'; kid: KidId; amount: number; reason: string }
  | { type: 'CHECK_IN'; kid: KidId }
  | { type: 'EDIT_PROFILE'; kid: KidId; name?: string; emoji?: string; colour?: string }
  | { type: 'SET_LOCK'; who: 'sai' | 'leila' | 'parent'; pin: string }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: AppState }

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

    case 'EDIT_PROFILE': {
      return updateKid(state, action.kid, (k) => ({
        ...k,
        name: action.name && action.name.trim() ? action.name.trim() : k.name,
        emoji: action.emoji && action.emoji.trim() ? action.emoji.trim() : k.emoji,
        colour: action.colour || k.colour,
      }))
    }

    case 'SET_LOCK': {
      const pin = action.pin.trim()
      return { ...state, locks: { ...getLocks(state), [action.who]: pin } }
    }

    case 'RESET': {
      // "Start over" resets the money, holdings, trades, badges and streaks —
      // but keeps who the accounts are (names, emojis, colours), their allowance
      // amounts and any passcodes, so a family doesn't have to set all that up
      // again every time.
      const fresh = makeInitialState()
      const carry = (id: KidId): KidProfile => ({
        ...fresh.kids[id],
        name: state.kids[id].name,
        emoji: state.kids[id].emoji,
        colour: state.kids[id].colour,
        allowance: { ...fresh.kids[id].allowance, amount: state.kids[id].allowance.amount },
      })
      return {
        ...fresh,
        kids: { sai: carry('sai'), leila: carry('leila') },
        locks: getLocks(state),
      }
    }

    case 'HYDRATE':
      // Replace all state with a version pulled from cross-device sync.
      return action.state

    default:
      return state
  }
}

export type SyncStatus = 'off' | 'connecting' | 'synced' | 'error'

interface StoreValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  /** Whether cross-device sync is available in this build. */
  syncAvailable: boolean
  /** The active family code, or null if not syncing. */
  familyCode: string | null
  syncStatus: SyncStatus
  joinFamily: (code: string) => void
  leaveFamily: () => void
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
  const [familyCode, setFamilyCode] = useState<string | null>(() =>
    SYNC_ENABLED ? loadFamilyCode() : null,
  )
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off')

  // Refs let the sync effects see the latest values without re-subscribing.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  const lastAppliedTs = useRef('') // remote timestamp we last applied/wrote
  const lastSyncedJson = useRef('') // state JSON last agreed with the server

  // Always keep a local copy (offline + the sync fallback).
  useEffect(() => {
    saveState(state)
  }, [state])

  // On joining a family: adopt the shared record if it exists, else publish
  // this device's current state as the shared starting point.
  useEffect(() => {
    if (!SYNC_ENABLED || !familyCode) {
      setSyncStatus('off')
      return
    }
    let cancelled = false
    setSyncStatus('connecting')
    ;(async () => {
      try {
        const remote = await getRemote(familyCode)
        if (cancelled) return
        if (remote) {
          lastSyncedJson.current = JSON.stringify(remote.state)
          lastAppliedTs.current = remote.updatedAt
          dispatch({ type: 'HYDRATE', state: remote.state })
        } else {
          const ts = await putRemote(familyCode, stateRef.current)
          lastSyncedJson.current = JSON.stringify(stateRef.current)
          lastAppliedTs.current = ts
        }
        if (!cancelled) setSyncStatus('synced')
      } catch (err) {
        if (!cancelled) {
          console.warn('sync: join failed', err)
          setSyncStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [familyCode])

  // Push local changes up (debounced). Skips when nothing actually changed,
  // which also stops a pull→apply→push feedback loop between devices.
  useEffect(() => {
    if (!SYNC_ENABLED || !familyCode) return
    const json = JSON.stringify(state)
    if (json === lastSyncedJson.current) return
    const handle = setTimeout(async () => {
      try {
        const ts = await putRemote(familyCode, state)
        lastSyncedJson.current = json
        lastAppliedTs.current = ts
        setSyncStatus('synced')
      } catch (err) {
        console.warn('sync: push failed', err)
        setSyncStatus('error')
      }
    }, 900)
    return () => clearTimeout(handle)
  }, [state, familyCode])

  // Poll for changes made on other devices and pull them in.
  useEffect(() => {
    if (!SYNC_ENABLED || !familyCode) return
    const id = setInterval(async () => {
      try {
        const remote = await getRemote(familyCode)
        if (!remote || remote.updatedAt <= lastAppliedTs.current) return
        lastSyncedJson.current = JSON.stringify(remote.state)
        lastAppliedTs.current = remote.updatedAt
        dispatch({ type: 'HYDRATE', state: remote.state })
        setSyncStatus('synced')
      } catch {
        /* keep last status; try again next tick */
      }
    }, 6000)
    return () => clearInterval(id)
  }, [familyCode])

  const joinFamily = useCallback((code: string) => {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    lastAppliedTs.current = ''
    lastSyncedJson.current = ''
    saveFamilyCode(clean)
    setFamilyCode(clean)
  }, [])

  const leaveFamily = useCallback(() => {
    clearFamilyCode()
    setFamilyCode(null)
    setSyncStatus('off')
  }, [])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      syncAvailable: SYNC_ENABLED,
      familyCode,
      syncStatus,
      joinFamily,
      leaveFamily,
    }),
    [state, familyCode, syncStatus, joinFamily, leaveFamily],
  )
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
