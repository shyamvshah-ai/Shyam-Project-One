// Small helpers shared by the price scripts.

/** Deterministic PRNG so the placeholder prices are identical every run. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Turn a string into a 32-bit seed. */
export function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** ISO date (YYYY-MM-DD) for a Date, in UTC. */
export function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

/**
 * List of business days (Mon–Fri) ending at `end`, going back `count` days.
 * Weekends are skipped so charts look like real trading days.
 */
export function businessDays(end, count) {
  const out = []
  const d = new Date(end.getTime())
  while (out.length < count) {
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) out.push(isoDate(d))
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return out.reverse()
}

export function round2(n) {
  return Math.round(n * 100) / 100
}
