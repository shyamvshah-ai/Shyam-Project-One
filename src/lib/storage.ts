import type { AppState } from '../types'

// Persistence for the single shared local instance. Everything lives in the
// browser's localStorage — no accounts, no server, no real money, so this is
// intentionally simple.

const KEY = 'money-explorers:v1'

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || typeof parsed !== 'object' || !parsed.kids) return null
    return parsed
  } catch {
    return null
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked (e.g. private mode). The app keeps working for
    // this session; we just can't persist. Not worth interrupting a child.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/** Short unique-ish id for trades and deposits. */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
