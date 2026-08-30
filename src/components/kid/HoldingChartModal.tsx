import type { Asset, TradeAction } from '../../types'
import type { HoldingView } from '../../lib/portfolio'
import { money, niceDate } from '../../lib/format'
import { GainPill } from '../common/ui'
import CompanyLogo from '../common/CompanyLogo'
import PriceChart from '../common/PriceChart'

// The expanded view of a My Money holding's chart — opened by tapping its small
// tile. Shows how far up or down the holding is (in %) since the day it was
// bought, measured against the average buy price so the line ends on the same
// number as the pill.

export default function HoldingChartModal({
  asset,
  view,
  since,
  detailed,
  onClose,
  onTrade,
}: {
  asset: Asset
  view: HoldingView
  since?: string
  detailed: boolean
  onClose: () => void
  onTrade: (asset: Asset, action: TradeAction) => void
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-night-800 p-5 text-ink shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <CompanyLogo asset={asset} size={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold text-ink">{asset.name}</div>
            {since && (
              <div className="text-xs text-slate-400">Bought {niceDate(since)}</div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 shrink-0 rounded-full bg-white/5 text-lg font-bold text-slate-400"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold text-ink">{money(view.value)}</span>
          <GainPill amount={view.gain} pct={view.gainPct} size="sm" pctOnly />
          <span className="text-xs font-semibold text-slate-400">since you bought it</span>
        </div>

        <PriceChart
          ticker={view.ticker}
          since={since}
          days={since ? 0 : 60}
          height={240}
          xLabel="Date"
          yLabel="Change (%)"
          percent
          percentBase={view.avgCost}
        />

        <div className="mt-3 flex gap-3">
          <button
            onClick={() => {
              onTrade(asset, 'sell')
              onClose()
            }}
            className="btn-ghost flex-1"
          >
            Sell
          </button>
          <button
            onClick={() => {
              onTrade(asset, 'buy')
              onClose()
            }}
            className="btn-primary flex-1"
          >
            Buy more
          </button>
        </div>
        {detailed && (
          <p className="mt-2 text-center text-xs text-slate-500">
            0% is what you paid on average. The line ends on today’s change.
          </p>
        )}
      </div>
    </div>
  )
}
