import { useState } from 'react'
import type { ProfileId } from '../types'
import { useStore } from '../state/store'
import { portfolioSummary } from '../lib/portfolio'
import { money } from '../lib/format'
import { PRICES_ARE_REAL } from '../lib/prices'
import BrandMark from './common/BrandMark'
import SyncSetup from './SyncSetup'

// The landing screen: "Who's exploring today?" — three big, friendly cards.

export default function ProfilePicker({ onPick }: { onPick: (id: ProfileId) => void }) {
  const { state, syncAvailable, familyCode } = useStore()
  const [showSync, setShowSync] = useState(false)
  const sai = state.kids.sai
  const leila = state.kids.leila

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-10">
      <div className="mb-3">
        <BrandMark size={64} />
      </div>
      <h1 className="text-center text-3xl font-extrabold text-ink sm:text-4xl">
        Junior Traders
      </h1>
      <p className="mb-8 mt-2 text-center text-ink-dim">
        Learn how investing works with pretend money. Who’s trading today?
      </p>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <KidCard
          emoji={sai.emoji}
          name={sai.name}
          colour={sai.colour}
          subtitle={`Worth ${money(portfolioSummary(sai).totalValue)}`}
          onClick={() => onPick('sai')}
        />
        <KidCard
          emoji={leila.emoji}
          name={leila.name}
          colour={leila.colour}
          subtitle={`Worth ${money(portfolioSummary(leila).totalValue)}`}
          onClick={() => onPick('leila')}
        />
        <KidCard
          emoji="🧑‍💼"
          name="Parent"
          colour="#4f46e5"
          subtitle="Overview & allowance"
          onClick={() => onPick('parent')}
        />
      </div>

      {syncAvailable && (
        <button
          onClick={() => setShowSync(true)}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10"
        >
          🔗 {familyCode ? `Synced · ${familyCode}` : 'Sync across devices'}
        </button>
      )}

      {!PRICES_ARE_REAL && (
        <p className="mt-6 max-w-md rounded-2xl bg-amber-400/10 px-4 py-3 text-center text-sm font-medium text-amber-200 ring-1 ring-amber-400/20">
          Using <strong>practice prices</strong> for now. A grown-up can run{' '}
          <code className="rounded bg-amber-400/20 px-1 text-amber-100">npm run refresh-prices</code>{' '}
          to switch to real market data.
        </p>
      )}

      {showSync && <SyncSetup onClose={() => setShowSync(false)} />}
    </div>
  )
}

function KidCard({
  emoji,
  name,
  colour,
  subtitle,
  onClick,
}: {
  emoji: string
  name: string
  colour: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="card flex flex-col items-center gap-2 p-6 text-center transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
      style={{ borderTop: `6px solid ${colour}` }}
    >
      <span className="text-6xl">{emoji}</span>
      <span className="text-xl font-extrabold text-ink">{name}</span>
      <span className="text-sm text-slate-400">{subtitle}</span>
    </button>
  )
}
