import { niceDate } from '../lib/format'
import { PRICES_ARE_REAL, PRICES_GENERATED_AT } from '../lib/prices'
import BrandMark from './common/BrandMark'

// Slim top bar shown above every logged-in view: brand, who you are, and a
// "switch" button to go back to the picker.

export default function AppHeader({
  emoji,
  name,
  colour,
  onSwitch,
}: {
  emoji: string
  name: string
  colour: string
  onSwitch: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-night-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <BrandMark size={26} />
          <span className="hidden font-extrabold text-ink sm:inline">Junior Traders</span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1"
            style={{ background: `${colour}22` }}
          >
            <span className="text-xl">{emoji}</span>
            <span className="font-bold text-ink">{name}</span>
          </div>
          <button onClick={onSwitch} className="btn-ghost text-sm">
            Switch
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-1 text-[11px] text-slate-400">
        {PRICES_ARE_REAL ? 'Real market prices' : 'Practice prices'} · updated{' '}
        {niceDate(PRICES_GENERATED_AT.slice(0, 10))}
      </div>
    </header>
  )
}
