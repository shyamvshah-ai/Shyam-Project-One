import { useMemo, useState } from 'react'
import type { Asset, KidProfile, TradeAction } from '../../types'
import { useStore } from '../../state/store'
import { latestPrice, localPrice, priceHistory } from '../../lib/prices'
import { moneyExact, moneySmart, localMoney, shares as fmtShares } from '../../lib/format'
import { Sparkline } from '../common/ui'
import CompanyLogo from '../common/CompanyLogo'

// The buy/sell dialog. Children think in pounds, not share counts, so they type
// a £ amount to spend (or cash out) and we work out the shares behind the scenes.
// The key teaching rule still lives here: you cannot confirm a trade without
// writing a one-line "why" note. That note goes into the journal.

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
  const isBuy = action === 'buy'

  // The pot of pounds this trade can draw on: cash to spend when buying, or the
  // current value of what they hold when selling.
  const holdValue = round(price * held)
  const budget = isBuy ? kid.cash : holdValue

  const [amount, setAmount] = useState<number>(() => round(Math.min(budget, isBuy ? 50 : budget)))
  const [note, setNote] = useState('')

  // Turn the £ amount into a number of shares. A full sell uses the exact holding
  // so no fractional "dust" is left behind by rounding.
  const shares =
    price > 0
      ? !isBuy && amount >= holdValue - 1e-9
        ? held
        : amount / price
      : 0

  const noteOk = note.trim().length >= 3
  const amountOk = amount > 0 && amount <= budget + 1e-9
  const canConfirm = noteOk && amountOk && shares > 0

  const spark = useMemo(() => priceHistory(asset.ticker, 90), [asset.ticker])

  function confirm() {
    if (!canConfirm) return
    dispatch({ type: isBuy ? 'BUY' : 'SELL', kid: kid.id, ticker: asset.ticker, shares, note })
    onClose()
  }

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

        {/* Spending money, front and centre — the number they care about. */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-mint/10 px-4 py-3 ring-1 ring-mint/20">
          <span className="font-bold text-ink">
            {isBuy ? '💰 Spending money' : '📦 This holding is worth'}
          </span>
          <span className="text-xl font-extrabold text-mint">
            {moneyExact(isBuy ? kid.cash : holdValue)}
          </span>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="amount" className="font-bold text-ink">
              How much to {isBuy ? 'spend' : 'sell'}?
            </label>
            <span className="text-sm text-slate-400">≈ {fmtShares(shares)} shares</span>
          </div>

          <div className="flex items-center gap-2">
            <StepButton label="−" onClick={() => setAmount((a) => Math.max(0, round(a - 5)))} />
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                £
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min={0}
                step={5}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, round(Number(e.target.value))))}
                className="w-full rounded-2xl border-2 border-white/10 py-2 pl-8 pr-3 text-center text-xl font-bold text-ink focus:border-brand-400 focus:outline-none"
              />
            </div>
            <StepButton label="+" onClick={() => setAmount((a) => round(Math.min(budget, a + 5)))} />
          </div>

          {budget > 0 && (
            <button
              className="mt-2 text-sm font-semibold text-mint"
              onClick={() => setAmount(round(budget))}
            >
              {isBuy ? `Spend all my money (${moneySmart(kid.cash)})` : `Sell all (${moneySmart(holdValue)})`}
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
          <span className="font-bold text-ink">{isBuy ? 'You’ll spend' : 'You’ll get'}</span>
          <span className="text-2xl font-extrabold text-ink">{moneyExact(amountOk ? amount : 0)}</span>
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
            {isBuy ? 'Buy' : 'Sell'} {amountOk ? moneySmart(amount) : ''}
          </button>
        </div>
        {!amountOk && amount > 0 && (
          <p className="mt-2 text-center text-sm text-down">
            {isBuy
              ? 'That’s more than your spending money.'
              : 'That’s more than this holding is worth.'}
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

function round(n: number): number {
  return Math.round(n * 100) / 100
}
