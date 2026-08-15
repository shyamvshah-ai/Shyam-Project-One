import { useState } from 'react'
import type { KidProfile } from '../../types'
import { useStore } from '../../state/store'
import { portfolioSummary } from '../../lib/portfolio'
import { getLocks } from '../../lib/locks'
import { money, moneyExact, niceDate } from '../../lib/format'
import { Card, GainPill, SectionTitle } from '../common/ui'

// Parent overview: both children's portfolios at a glance, plus topping up each
// child's virtual allowance. (Editing the universe and diversification rules are
// planned for a later pass — noted in the README.)

export default function ParentDashboard({
  onOpenKid,
}: {
  onOpenKid: (id: 'sai' | 'leila') => void
}) {
  const { state, dispatch, familyCode } = useStore()
  const kids = [state.kids.sai, state.kids.leila]

  const startOver = () => {
    const synced = familyCode ? '\n\nBecause sync is on, this resets every device.' : ''
    const ok = window.confirm(
      'Start over?\n\nThis puts BOTH children back to £1,000 with nothing invested, and clears all their trades, badges and streaks. This cannot be undone.' +
        synced,
    )
    if (ok) dispatch({ type: 'RESET' })
  }
  const combined = kids.reduce(
    (acc, k) => {
      const p = portfolioSummary(k)
      acc.value += p.totalValue
      acc.deposited += p.totalDeposited
      acc.gain += p.totalGain
      return acc
    },
    { value: 0, deposited: 0, gain: 0 },
  )

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-5">
      <Card className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white ring-0">
        <div className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          Both children together
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <span className="text-4xl font-extrabold">{money(combined.value)}</span>
          <GainPill amount={combined.gain} pct={combined.deposited ? combined.gain / combined.deposited : 0} size="md" />
        </div>
        <div className="mt-1 text-sm text-brand-100">
          {money(combined.deposited)} paid in across both accounts
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {kids.map((k) => (
          <KidSummaryCard key={k.id} kid={k} onOpen={() => onOpenKid(k.id)} />
        ))}
      </div>

      <Card>
        <SectionTitle>About this dashboard</SectionTitle>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Everything here is <strong>pretend money</strong> — there is no real account or risk.</li>
          <li>Real prices refresh automatically every day.</li>
          <li>Coming next: editing the stock/ETF list, diversification rules and a weekly recap.</li>
        </ul>
      </Card>

      <Card>
        <SectionTitle>Passcodes</SectionTitle>
        <p className="mb-3 text-sm text-slate-400">
          Give each child a 4-digit code so they can’t open each other’s account. Set a{' '}
          <strong>grown-up code</strong> too — it locks this Parent area and works as a master
          key that opens either child.{' '}
          {familyCode && 'Codes apply on every synced device.'}
        </p>
        <div className="space-y-2">
          <LockRow who="sai" label={`${state.kids.sai.emoji} ${state.kids.sai.name}`} />
          <LockRow who="leila" label={`${state.kids.leila.emoji} ${state.kids.leila.name}`} />
          <LockRow who="parent" label="🧑‍💼 Grown-up (Parent area)" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          A light lock for pretend money — not real security. If a code is forgotten, set a new
          one here (or clear it).
        </p>
      </Card>

      <Card>
        <SectionTitle>Start over</SectionTitle>
        <p className="mb-3 text-sm text-slate-400">
          Reset <strong>both children</strong> back to £1,000 with nothing invested — clears all
          trades, badges and streaks.{' '}
          {familyCode && 'Because sync is on, this resets every device.'}
        </p>
        <button
          onClick={startOver}
          className="btn bg-down text-white ring-1 ring-white/10 hover:bg-red-600"
        >
          ↺ Start everyone over
        </button>
      </Card>
    </div>
  )
}

function LockRow({ who, label }: { who: 'sai' | 'leila' | 'parent'; label: string }) {
  const { state, dispatch } = useStore()
  const current = getLocks(state)[who]
  const [entry, setEntry] = useState('')

  const clean = entry.replace(/\D/g, '').slice(0, 4)
  const canSave = clean.length === 4 && clean !== current

  const save = () => {
    if (!canSave) return
    dispatch({ type: 'SET_LOCK', who, pin: clean })
    setEntry('')
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-3">
      <div className="flex-1">
        <div className="font-bold text-ink">{label}</div>
        <div className="text-xs text-slate-400">{current ? '🔒 Code set' : '🔓 No code'}</div>
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={entry}
        placeholder={current ? '••••' : 'set code'}
        onChange={(e) => setEntry(e.target.value.replace(/\D/g, '').slice(0, 4))}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        className="w-24 rounded-xl border-2 border-white/10 bg-white/5 py-2 text-center font-mono text-lg tracking-widest text-ink placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-500 focus:border-brand-400 focus:outline-none"
      />
      <button onClick={save} disabled={!canSave} className="btn-primary text-sm">
        {current ? 'Change' : 'Set'}
      </button>
      {current && (
        <button
          onClick={() => dispatch({ type: 'SET_LOCK', who, pin: '' })}
          className="btn-ghost text-sm"
        >
          Clear
        </button>
      )}
    </div>
  )
}

function KidSummaryCard({ kid, onOpen }: { kid: KidProfile; onOpen: () => void }) {
  const { dispatch } = useStore()
  const p = portfolioSummary(kid)
  const [amount, setAmount] = useState(kid.allowance.amount)

  return (
    <Card style={{ borderTop: `6px solid ${kid.colour}` }}>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{kid.emoji}</span>
        <div className="flex-1">
          <div className="text-xl font-extrabold text-ink">{kid.name}</div>
          <div className="text-sm text-slate-400">
            {kid.holdings.length} holdings · {moneyExact(kid.cash)} cash
          </div>
        </div>
        <button className="btn-ghost text-sm" onClick={onOpen}>
          Open →
        </button>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-ink">{money(p.totalValue)}</span>
        <GainPill amount={p.totalGain} pct={p.totalGainPct} size="sm" />
      </div>

      <div className="mt-4 rounded-2xl bg-white/5 p-3">
        <div className="mb-2 text-sm font-bold text-ink">Top up allowance</div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              £
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border-2 border-white/10 py-2 pl-7 pr-3 font-bold text-ink focus:border-brand-400 focus:outline-none"
            />
          </div>
          <button
            className="btn-primary"
            disabled={amount <= 0}
            onClick={() =>
              dispatch({
                type: 'TOP_UP',
                kid: kid.id,
                amount,
                reason: 'Allowance from parent',
              })
            }
          >
            Pay in
          </button>
        </div>
        <div className="mt-1 text-xs text-slate-400">
          Last topped up {niceDate(kid.allowance.lastPaid)}
        </div>
      </div>
    </Card>
  )
}
