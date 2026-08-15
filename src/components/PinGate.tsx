import { useEffect, useState } from 'react'
import type { Locks, ProfileId } from '../types'
import { unlocks } from '../lib/locks'

// A friendly passcode pad shown when someone taps a locked profile on the
// picker. Works with just taps (no keyboard needed on a tablet). The grown-up
// code opens either child too, so a parent is never locked out.

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function PinGate({
  profileId,
  name,
  emoji,
  colour,
  locks,
  onUnlock,
  onCancel,
}: {
  profileId: ProfileId
  name: string
  emoji: string
  colour: string
  locks: Locks
  onUnlock: () => void
  onCancel: () => void
}) {
  const [entry, setEntry] = useState('')
  const [wrong, setWrong] = useState(false)

  // Check whenever a 4-digit code is complete.
  useEffect(() => {
    if (entry.length < 4) return
    if (unlocks(locks, profileId, entry)) {
      onUnlock()
    } else {
      setWrong(true)
      const t = setTimeout(() => {
        setWrong(false)
        setEntry('')
      }, 600)
      return () => clearTimeout(t)
    }
  }, [entry, locks, profileId, onUnlock])

  const press = (key: string) => {
    if (key === '⌫') {
      setEntry((e) => e.slice(0, -1))
      return
    }
    if (key === '') return
    setEntry((e) => (e.length >= 4 ? e : e + key))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-t-3xl bg-night-800 p-6 text-center text-ink shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
          style={{ background: `${colour}22` }}
        >
          {emoji}
        </div>
        <div className="text-lg font-extrabold text-ink">{name}’s code</div>
        <p className="mb-4 text-sm text-slate-400">Enter the 4-digit code to open</p>

        <div className={`mb-5 flex justify-center gap-3 ${wrong ? 'animate-pulse' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full ${
                wrong
                  ? 'bg-down'
                  : i < entry.length
                    ? 'bg-mint'
                    : 'bg-white/15'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {PAD.map((key, i) =>
            key === '' ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                onClick={() => press(key)}
                className="h-14 rounded-2xl bg-white/5 text-2xl font-bold text-ink ring-1 ring-white/10 active:scale-95 active:bg-white/15"
              >
                {key}
              </button>
            ),
          )}
        </div>

        {wrong && <p className="mt-3 text-sm font-semibold text-down">Wrong code — try again</p>}

        <button onClick={onCancel} className="btn-ghost mt-4 w-full">
          Back
        </button>
      </div>
    </div>
  )
}
