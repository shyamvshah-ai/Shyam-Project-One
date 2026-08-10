import type { KidProfile } from '../../types'
import { getAsset } from '../../data/universe'
import { moneyExact, niceDate, shares as fmtShares } from '../../lib/format'
import { Card, SectionTitle } from '../common/ui'

// "Diary" — the trade journal. Every buy/sell shows the child's own reason, so
// they can look back and see how their thinking changed over time.

export default function JournalView({ kid }: { kid: KidProfile }) {
  const trades = kid.trades // already newest-first
  const deposits = kid.deposits.slice().reverse()

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>My trade diary 📔</SectionTitle>
        <p className="mb-3 text-sm text-indigo-500">
          Every time you buy or sell, you write down <em>why</em>. Reading these later is one of
          the best ways to become a smarter investor.
        </p>
        {trades.length === 0 ? (
          <p className="text-indigo-500">No trades yet — your first one will appear here.</p>
        ) : (
          <ol className="space-y-2">
            {trades.map((t) => {
              const asset = getAsset(t.ticker)
              const isBuy = t.action === 'buy'
              return (
                <li
                  key={t.id}
                  className="flex gap-3 rounded-2xl bg-indigo-50/60 p-3"
                >
                  <span className="text-2xl">{asset?.emoji ?? '📈'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span
                        className={`pill !px-2 !py-0 text-xs ${
                          isBuy ? 'bg-up-soft text-up' : 'bg-down-soft text-down'
                        }`}
                      >
                        {isBuy ? 'Bought' : 'Sold'}
                      </span>
                      <span className="font-extrabold text-indigo-900">{asset?.name ?? t.ticker}</span>
                      <span className="text-sm text-indigo-400">
                        {fmtShares(t.shares)} × {moneyExact(t.price)}
                      </span>
                      <span className="ml-auto text-xs text-indigo-300">{niceDate(t.date)}</span>
                    </div>
                    {t.note && (
                      <p className="mt-1 text-sm italic text-indigo-700">“{t.note}”</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Card>

      <Card>
        <SectionTitle>Money paid in 🐷</SectionTitle>
        {deposits.length === 0 ? (
          <p className="text-indigo-500">No pocket money added yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {deposits.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-indigo-700">
                  {d.reason} <span className="text-indigo-300">· {niceDate(d.date)}</span>
                </span>
                <span className="font-bold text-up">+{moneyExact(d.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
