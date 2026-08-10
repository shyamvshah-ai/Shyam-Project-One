import { useState } from 'react'
import type { Asset, TradeAction } from '../../types'
import { useKid, useStore } from '../../state/store'
import PortfolioView from './PortfolioView'
import ExploreView from './ExploreView'
import ChartsView from './ChartsView'
import JournalView from './JournalView'
import TradeModal from './TradeModal'

type Tab = 'money' | 'explore' | 'charts' | 'journal'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'money', label: 'My Money', emoji: '💰' },
  { id: 'explore', label: 'Explore', emoji: '🔭' },
  { id: 'charts', label: 'Charts', emoji: '📈' },
  { id: 'journal', label: 'Diary', emoji: '📔' },
]

export interface TradeRequest {
  asset: Asset
  action: TradeAction
}

export default function KidDashboard({ kidId }: { kidId: 'sai' | 'leila' }) {
  const kid = useKid(kidId)
  const { dispatch } = useStore()
  const [tab, setTab] = useState<Tab>('money')
  const [trade, setTrade] = useState<TradeRequest | null>(null)

  const openTrade = (asset: Asset, action: TradeAction) => setTrade({ asset, action })
  const detailed = kid.viewMode === 'detailed'

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Simple / detailed toggle — lets the app grow with the child. */}
      <div className="flex items-center justify-end pt-4">
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
          <button
            className={`tab px-4 py-1 ${!detailed ? 'bg-brand-600 text-white' : 'text-indigo-500'}`}
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', kid: kidId, mode: 'simple' })}
          >
            😀 Simple
          </button>
          <button
            className={`tab px-4 py-1 ${detailed ? 'bg-brand-600 text-white' : 'text-indigo-500'}`}
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', kid: kidId, mode: 'detailed' })}
          >
            🤓 Detailed
          </button>
        </div>
      </div>

      <main className="py-4">
        {tab === 'money' && <PortfolioView kid={kid} detailed={detailed} onTrade={openTrade} />}
        {tab === 'explore' && <ExploreView kid={kid} detailed={detailed} onTrade={openTrade} />}
        {tab === 'charts' && <ChartsView kid={kid} detailed={detailed} />}
        {tab === 'journal' && <JournalView kid={kid} />}
      </main>

      {/* Bottom tab bar — big, thumb-friendly targets. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-bold transition ${
                tab === t.id ? 'text-brand-700' : 'text-indigo-300'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {trade && (
        <TradeModal
          kid={kid}
          asset={trade.asset}
          action={trade.action}
          onClose={() => setTrade(null)}
        />
      )}
    </div>
  )
}
