import { useState } from 'react'
import { useStore } from '../state/store'
import { makeFamilyCode } from '../lib/storage'

// A small dialog to turn on cross-device sync with a shared "family code".
// Type the same code on every device and their progress stays in sync.

export default function SyncSetup({ onClose }: { onClose: () => void }) {
  const { familyCode, syncStatus, joinFamily, leaveFamily } = useStore()
  const [entry, setEntry] = useState('')
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (!familyCode) return
    try {
      await navigator.clipboard.writeText(familyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard may be blocked; the code is shown on screen anyway */
    }
  }

  const statusText: Record<string, string> = {
    connecting: '⏳ Connecting…',
    synced: '✅ Synced',
    error: '⚠️ Can’t reach sync — check the code / connection',
    off: '',
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-night-800 p-5 text-ink shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2 text-lg font-extrabold">
          🔗 Sync across devices
        </div>

        {familyCode ? (
          <>
            <p className="mb-3 text-sm text-slate-400">
              This device is syncing. Type the same code on any other device (phone, tablet,
              laptop) to share the same portfolios and progress.
            </p>
            <div className="mb-3 rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Your family code
              </div>
              <div className="my-1 select-all font-mono text-3xl font-extrabold tracking-[0.25em] text-mint">
                {familyCode}
              </div>
              <button onClick={copyCode} className="btn-ghost mt-1 text-sm">
                {copied ? 'Copied!' : 'Copy code'}
              </button>
            </div>
            {statusText[syncStatus] && (
              <div className="mb-3 text-center text-sm text-slate-300">{statusText[syncStatus]}</div>
            )}
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-primary flex-1">
                Done
              </button>
              <button onClick={leaveFamily} className="btn-ghost flex-1">
                Stop syncing
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Pretend-money data only. Anyone with this code can see and change these portfolios,
              so keep it within the family.
            </p>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-400">
              Turn this on so Sai and Leila can use the app on their own devices and keep the same
              portfolios. Start on the device that has the progress you want to keep.
            </p>

            <button
              onClick={() => joinFamily(makeFamilyCode())}
              className="btn-primary mb-4 w-full"
            >
              ✨ Create a family code
            </button>

            <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              or join with an existing code
            </div>
            <div className="flex gap-2">
              <input
                value={entry}
                onChange={(e) => setEntry(e.target.value.toUpperCase())}
                placeholder="e.g. K7P2QX"
                maxLength={12}
                className="w-full rounded-2xl border-2 border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-lg tracking-widest text-ink placeholder:text-slate-500 focus:border-mint/60 focus:outline-none"
              />
              <button
                onClick={() => joinFamily(entry)}
                disabled={entry.trim().length < 4}
                className="btn-primary"
              >
                Join
              </button>
            </div>

            <button onClick={onClose} className="btn-ghost mt-4 w-full">
              Not now
            </button>
          </>
        )}
      </div>
    </div>
  )
}
