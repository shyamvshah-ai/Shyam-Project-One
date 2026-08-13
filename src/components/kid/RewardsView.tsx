import type { KidProfile } from '../../types'
import { useStore } from '../../state/store'
import { portfolioSummary } from '../../lib/portfolio'
import { BADGES } from '../../lib/badges'
import { money, percent, niceDate, isThisWeek } from '../../lib/format'
import { Card, GainPill, SectionTitle } from '../common/ui'

// "Fun" — the motivation layer: a weekly check-in streak (rewards patience, not
// day-trading), a friendly Sai-vs-Leila leaderboard, and badges to collect.

export default function RewardsView({ kid, detailed }: { kid: KidProfile; detailed: boolean }) {
  return (
    <div className="space-y-4">
      <StreakCard kid={kid} />
      <Leaderboard meId={kid.id} detailed={detailed} />
      <BadgesCard kid={kid} />
    </div>
  )
}

function StreakCard({ kid }: { kid: KidProfile }) {
  const { dispatch } = useStore()
  const checkedIn = isThisWeek(kid.streak.lastCheckIn)
  const weeks = kid.streak.weeks

  return (
    <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-0">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{weeks > 0 ? '🔥' : '📅'}</div>
        <div className="flex-1">
          <div className="text-2xl font-extrabold">
            {weeks > 0 ? `${weeks}-week streak!` : 'Start your streak'}
          </div>
          <div className="text-sm text-amber-50">
            Checking in once a week builds good habits — patience beats rushing.
          </div>
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: 'CHECK_IN', kid: kid.id })}
        disabled={checkedIn}
        className="mt-3 w-full rounded-full bg-white/95 px-4 py-2 font-extrabold text-orange-600 shadow-sm transition active:scale-95 disabled:opacity-70"
      >
        {checkedIn ? '✓ Checked in this week — see you next week!' : 'Check in this week'}
      </button>
    </Card>
  )
}

function Leaderboard({ meId, detailed }: { meId: 'sai' | 'leila'; detailed: boolean }) {
  const { state } = useStore()
  const rows = (['sai', 'leila'] as const)
    .map((id) => {
      const kid = state.kids[id]
      const p = portfolioSummary(kid)
      return { id, kid, value: p.totalValue, gain: p.totalGain, gainPct: p.totalGainPct }
    })
    // Rank by growth %, so starting with the same £1,000 it's a fair race.
    .sort((a, b) => b.gainPct - a.gainPct)

  const tied = rows[0].gainPct === rows[1].gainPct

  return (
    <Card>
      <SectionTitle>🏆 Leaderboard</SectionTitle>
      <p className="mb-3 text-sm text-slate-400">
        Who’s grown their money the most (in %) — you both started with the same £1,000.
      </p>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const isMe = r.id === meId
          const medal = tied ? '🤝' : i === 0 ? '🥇' : '🥈'
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                isMe ? 'bg-white/10 ring-2 ring-brand-200' : 'bg-white/5'
              }`}
            >
              <span className="text-2xl">{medal}</span>
              <span className="text-2xl">{r.kid.emoji}</span>
              <div className="flex-1">
                <div className="font-extrabold text-ink">
                  {r.kid.name} {isMe && <span className="text-mint">(you)</span>}
                </div>
                <div className="text-sm text-slate-400">{money(r.value)}</div>
              </div>
              {detailed ? (
                <GainPill amount={r.gain} pct={r.gainPct} size="sm" />
              ) : (
                <span
                  className={`font-extrabold ${
                    r.gain > 0 ? 'text-up' : r.gain < 0 ? 'text-down' : 'text-slate-400'
                  }`}
                >
                  {r.gain === 0 ? 'even' : percent(r.gainPct)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {tied && (
        <p className="mt-2 text-center text-sm text-slate-400">
          Neck and neck! Make your first trade to pull ahead.
        </p>
      )}
    </Card>
  )
}

function BadgesCard({ kid }: { kid: KidProfile }) {
  const earnedCount = Object.keys(kid.badges).length
  return (
    <Card>
      <SectionTitle>
        🎖️ Badges <span className="text-slate-500">({earnedCount}/{BADGES.length})</span>
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BADGES.map((b) => {
          const earned = kid.badges[b.id]
          return (
            <div
              key={b.id}
              className={`rounded-2xl p-3 text-center transition ${
                earned ? 'bg-up-soft ring-1 ring-up/30' : 'bg-white/5 opacity-70'
              }`}
              title={b.how}
            >
              <div className={`text-3xl ${earned ? '' : 'grayscale'}`}>{b.emoji}</div>
              <div className="mt-1 text-sm font-bold text-ink">{b.name}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-slate-400">
                {earned ? `Earned ${niceDate(earned.earnedAt)}` : b.how}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
