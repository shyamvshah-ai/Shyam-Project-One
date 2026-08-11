import { useState } from 'react'
import type { Asset, TradeAction } from '../../types'
import { dailyChange, latestPrice, localPrice } from '../../lib/prices'
import { moneyExact, localMoney } from '../../lib/format'
import { GainPill } from '../common/ui'
import PriceChart, { RANGES } from '../common/PriceChart'

// A pop-up showing an asset's full historical price chart, opened by tapping the
// mini-chart on an Explore card. Works for anything, owned or not.

export default function AssetChartModal({
  asset,
  detailed,
  onClose,
  onTrade,
}: {
  asset: Asset
  detailed: boolean
  onClose: () => void
  onTrade: (asset: Asset, action: TradeAction) => void
}) {
  const [rangeIdx, setRangeIdx] = useState(3) // default 1Y
  const price = latestPrice(asset.ticker) ?? 0
  const local = localPrice(asset.ticker)
  const day = dailyChange(asset.ticker)

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="text-4xl">{asset.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold text-indigo-900">{asset.name}</div>
            <div className="text-xs text-indigo-400">
              {asset.kind === 'etf' ? '🧺 Basket' : '🏢 Company'} · {asset.sector} · {asset.geography}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 shrink-0 rounded-full bg-indigo-50 text-lg font-bold text-indigo-500"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold text-indigo-900">{moneyExact(price)}</span>
          {local && local.currency !== 'GBP' && (
            <span className="text-sm font-semibold text-indigo-400">
              {localMoney(local.currency, local.price)}
            </span>
          )}
          <GainPill amount={day.change} pct={day.pct} simple={!detailed} size="sm" />
        </div>

        <div className="mb-2 flex gap-1">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                rangeIdx === i ? 'bg-indigo-900 text-white' : 'bg-indigo-50 text-indigo-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <PriceChart ticker={asset.ticker} days={RANGES[rangeIdx].days} height={220} />

        <p className="mt-2 rounded-2xl bg-brand-50 p-3 text-sm text-indigo-700">{asset.blurb}</p>

        <div className="mt-3 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Close
          </button>
          <button
            onClick={() => {
              onTrade(asset, 'buy')
              onClose()
            }}
            className="btn-primary flex-1"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}
