import type { AppState, Locks, ProfileId } from '../types'

// Helpers for the per-profile passcodes. Kept tiny and defensive so state saved
// or synced before this feature existed (no `locks` field) still works.

export const emptyLocks = (): Locks => ({ sai: '', leila: '', parent: '' })

/** The current locks, always a full object even if state predates the feature. */
export function getLocks(state: AppState): Locks {
  return { ...emptyLocks(), ...(state.locks ?? {}) }
}

/** The code that must be entered to open a profile ('' if it isn't locked). */
export function codeFor(locks: Locks, id: ProfileId): string {
  return id === 'parent' ? locks.parent : locks[id]
}

/**
 * Does `entry` open `id`? The profile's own code works, and the grown-up code
 * is a master key for either child (but not the other way round).
 */
export function unlocks(locks: Locks, id: ProfileId, entry: string): boolean {
  const own = codeFor(locks, id)
  if (own && entry === own) return true
  if (id !== 'parent' && locks.parent && entry === locks.parent) return true
  return false
}
