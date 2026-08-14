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

// --- Family code (for cross-device sync) --------------------------------------

const FAMILY_KEY = 'junior-traders:family'

export function loadFamilyCode(): string | null {
  try {
    return localStorage.getItem(FAMILY_KEY)
  } catch {
    return null
  }
}

export function saveFamilyCode(code: string): void {
  try {
    localStorage.setItem(FAMILY_KEY, code)
  } catch {
    /* ignore */
  }
}

export function clearFamilyCode(): void {
  try {
    localStorage.removeItem(FAMILY_KEY)
  } catch {
    /* ignore */
  }
}

/** A short, unguessable, easy-to-read family code (no ambiguous characters). */
export function makeFamilyCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}
