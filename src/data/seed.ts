import type { AppState, KidProfile } from '../types'
import { LATEST_DATE } from '../lib/prices'
import { newId } from '../lib/storage'
import { emptyLocks } from '../lib/locks'

// Both children start fresh today with £1,000 of pretend money and nothing
// invested yet — a clean slate to make their own choices. The Parent can add
// more allowance any time, and "Start over" resets back to this.

const TODAY = LATEST_DATE // the most recent trading day in the price data
const STARTING_CASH = 1000

interface SeedKid {
  id: 'sai' | 'leila'
  name: string
  emoji: string
  colour: string
  viewMode: 'simple' | 'detailed'
  allowance: number
}

const SEED: SeedKid[] = [
  { id: 'sai', name: 'Sai', emoji: '🦖', colour: '#f97316', viewMode: 'simple', allowance: 10 },
  { id: 'leila', name: 'Leila', emoji: '🦩', colour: '#ec4899', viewMode: 'detailed', allowance: 10 },
]

function buildKid(seed: SeedKid): KidProfile {
  return {
    id: seed.id,
    name: seed.name,
    emoji: seed.emoji,
    colour: seed.colour,
    cash: STARTING_CASH,
    holdings: [],
    trades: [],
    deposits: [{ id: newId(), date: TODAY, amount: STARTING_CASH, reason: 'Starting money' }],
    viewMode: seed.viewMode,
    badges: {},
    streak: { lastCheckIn: null, weeks: 0 },
    allowance: { amount: seed.allowance, lastPaid: TODAY },
  }
}

export function makeInitialState(): AppState {
  return {
    version: 2,
    epoch: 0,
    kids: {
      sai: buildKid(SEED[0]),
      leila: buildKid(SEED[1]),
    },
    locks: emptyLocks(),
  }
}
