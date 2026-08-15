import { useState } from 'react'
import type { ProfileId } from './types'
import { useStore } from './state/store'
import { codeFor, getLocks } from './lib/locks'
import ProfilePicker from './components/ProfilePicker'
import PinGate from './components/PinGate'
import AppHeader from './components/AppHeader'
import KidDashboard from './components/kid/KidDashboard'
import ParentDashboard from './components/parent/ParentDashboard'

export default function App() {
  const { state } = useStore()
  const [profile, setProfile] = useState<ProfileId | null>(null)
  // A profile chosen on the picker that still needs its passcode entered.
  const [pending, setPending] = useState<ProfileId | null>(null)

  const locks = getLocks(state)

  // Tapping a profile on the picker: open it straight away if it has no code,
  // otherwise show the passcode pad first.
  const requestProfile = (id: ProfileId) => {
    if (codeFor(locks, id)) setPending(id)
    else setProfile(id)
  }

  if (profile === null) {
    const p = pending ? profileMeta(state, pending) : null
    return (
      <>
        <ProfilePicker onPick={requestProfile} />
        {pending && p && (
          <PinGate
            profileId={pending}
            name={p.name}
            emoji={p.emoji}
            colour={p.colour}
            locks={locks}
            onUnlock={() => {
              setProfile(pending)
              setPending(null)
            }}
            onCancel={() => setPending(null)}
          />
        )}
      </>
    )
  }

  if (profile === 'parent') {
    return (
      <div className="min-h-full pb-16">
        <AppHeader emoji="🧑‍💼" name="Parent" colour="#4f46e5" onSwitch={() => setProfile(null)} />
        {/* The parent is already unlocked, so opening a child from here needs no code. */}
        <ParentDashboard onOpenKid={(id) => setProfile(id)} />
      </div>
    )
  }

  const kid = state.kids[profile]
  return (
    <div className="min-h-full pb-16">
      <AppHeader
        emoji={kid.emoji}
        name={kid.name}
        colour={kid.colour}
        onSwitch={() => setProfile(null)}
      />
      <KidDashboard kidId={profile} />
    </div>
  )
}

function profileMeta(
  state: ReturnType<typeof useStore>['state'],
  id: ProfileId,
): { name: string; emoji: string; colour: string } {
  if (id === 'parent') return { name: 'Parent', emoji: '🧑‍💼', colour: '#4f46e5' }
  const k = state.kids[id]
  return { name: k.name, emoji: k.emoji, colour: k.colour }
}
