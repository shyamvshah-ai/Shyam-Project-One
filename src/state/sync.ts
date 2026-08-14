import type { AppState } from '../types'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/syncConfig'

// Tiny cross-device sync client. It stores one row per family code — the whole
// app state as a JSON blob — in a Supabase table via its REST API. No SDK, just
// fetch. All calls are best-effort; failures never break the local app.

const TABLE = 'families'

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export interface RemoteState {
  state: AppState
  /** ISO timestamp of the last write (used for last-write-wins). */
  updatedAt: string
}

/** Read the shared state for a family code, or null if none exists yet. */
export async function getRemote(code: string): Promise<RemoteState | null> {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?code=eq.${encodeURIComponent(
    code,
  )}&select=state,updated_at`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) throw new Error(`sync read failed (${res.status})`)
  const rows = (await res.json()) as { state: AppState; updated_at: string }[]
  if (!Array.isArray(rows) || rows.length === 0) return null
  return { state: rows[0].state, updatedAt: rows[0].updated_at }
}

/** Upsert the shared state for a family code. Returns the write timestamp. */
export async function putRemote(code: string, state: AppState): Promise<string> {
  const updated_at = new Date().toISOString()
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?on_conflict=code`
  const res = await fetch(url, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ code, state, updated_at }),
  })
  if (!res.ok) throw new Error(`sync write failed (${res.status})`)
  return updated_at
}
