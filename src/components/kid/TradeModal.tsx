import { useMemo, useState } from 'react'
import type { Asset, KidProfile, TradeAction } from '../../types'
import { useStore } from '../../state/store'
import { latestPrice, localPrice, priceHistory } from '../../lib/prices'
import { moneyExact, moneySmart, localMoney, shares as fmtShares } from '../../lib/format'
import { Sparkline } from '../common/ui'
import CompanyLogo from '../common/CompanyLogo'

// The buy/sell dialog. The key teaching rule lives here: you cannot confirm a
// trade without writing a one-line "why" note. That note goes into the journal.

export default function TradeModal({
  kid,
  asset,
  action,
  onClose,
}: {
  kid: KidProfile
  asset: Asset
  action: TradeAction
  onClose: () => void
}) {
  const { dispatch } = useStore()
  const price = latestPrice(asset.ticker) ?? 0
  const held = kid.holdings.find((h) => h.ticker === asset.ticker)?.shares ?? 0

  const stepSize = step(price)
  // The most you can afford, rounded down to the buy step (supports fractions
  // so a child with only a few pounds can still own a slice of a pricey stock).
  const maxBuy = price > 0 ? Math.floor(kid.cash / price / stepSize) * stepSize : 0
  const [shares, setShares] = useState<number>(
    action === 'buy' ? (maxBuy >= 1 ? 1 : round(maxBuy)) : Math.min(1, held),
  )
  const [note, setNote] = useState('')

  const total = price * shares
  const noteOk = note.trim().length >= 3
  const sharesOk =
    shares > 0 && (action === 'buy' ? total <= kid.cash + 1e-9 : shares <= held + 1e-9)
  const canConfirm = noteOk && sharesOk

  const spark = useMemo(() => priceHistory(asset.ticker, 90), [asset.ticker])

  function confirm() {
    if (!canConfirm) return
    dispatch({ type: action === 'buy' ? 'BUY' : 'SELL', kid: kid.id, ticker: asset.ticker, shares, note })
    onClose()
  }

  const isBuy = action === 'buy'

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-night-800 p-5 text-ink shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-3">
          <CompanyLogo asset={asset} size={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold text-ink">{asset.name}</div>
            <div className="text-sm text-slate-400">
              {moneyExact(price)} each
              {(() => {
                const l = localPrice(asset.ticker)
                return l && l.currency !== 'GBP' ? ` · ${localMoney(l.currency, l.price)}` : ''
              })()}
            </div>
          </div>
          <Sparkline points={spark} />
        </div>

        <p className="mb-4 rounded-2xl bg-white/10 p-3 text-sm text-brand-200">{asset.blurb}</p>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="font-bold text-ink">
              How many {isBuy ? 'to buy' : 'to sell'}?
            </label>
            <span className="text-sm text-slate-400">
              {isBuy
                ? `You have ${moneySmart(kid.cash)}`
                : `You hold ${fmtShares(held)}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StepButton label="−" onClick={() => setShares((s) => Math.max(0, round(s - step(price))))} />
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={step(price)}
              value={shares}
              onChange={(e) => setShares(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl border-2 border-white/10 px-3 py-2 text-center text-xl font-bold text-ink focus:border-brand-400 focus:outline-none"
            />
            <StepButton label="+" onClick={() => setShares((s) => round(s + step(price)))} />
          </div>

          {isBuy && maxBuy > 0 && (
            <button
              className="mt-2 text-sm font-semibold text-mint"
              onClick={() => setShares(maxBuy)}
            >
              Buy as many as I can afford ({fmtShares(maxBuy)})
            </button>
          )}
          {!isBuy && held > 0 && (
            <button className="mt-2 text-sm font-semibold text-mint" onClick={() => setShares(held)}>
              Sell all ({fmtShares(held)})
            </button>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="why" className="mb-1 block font-bold text-ink">
            Why are you {isBuy ? 'buying' : 'selling'} this?{' '}
            <span className="font-normal text-slate-400">(you must write one line)</span>
          </label>
          <textarea
            id="why"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={
              isBuy
                ? 'e.g. I use their products all the time and think more people will too'
                : 'e.g. I need the money for something else, or I changed my mind'
            }
            className="w-full resize-none rounded-2xl border-2 border-white/10 px-3 py-2 text-ink focus:border-brand-400 focus:outline-none"
          />
          {!noteOk && note.length > 0 && (
            <p className="mt-1 text-xs text-amber-600">A few more words — this becomes your trade diary.</p>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <span className="font-bold text-ink">{isBuy ? 'Total cost' : 'You get'}</span>
          <span className="text-2xl font-extrabold text-ink">{moneyExact(total)}</span>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={!canConfirm}
            className={`flex-1 ${isBuy ? 'btn-primary' : 'btn bg-down text-white hover:bg-red-700'}`}
          >
            {isBuy ? 'Buy' : 'Sell'} {shares > 0 ? fmtShares(shares) : ''}
          </button>
        </div>
        {!sharesOk && shares > 0 && (
          <p className="mt-2 text-center text-sm text-down">
            {isBuy ? 'That costs more than your cash.' : 'You don’t have that many to sell.'}
          </p>
        )}
      </div>
    </div>
  )
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-11 w-11 shrink-0 rounded-2xl bg-white/10 text-2xl font-bold text-brand-200 active:scale-95"
      aria-label={label === '+' ? 'increase' : 'decrease'}
    >
      {label}
    </button>
  )
}

// Cheaper assets step by whole shares; pricey ones let you buy fractions so a
// child with a few pounds can still take part.
function step(price: number): number {
  return price > 60 ? 0.05 : 1
}
function round(n: number): number {
  return Math.round(n * 100) / 100
}
