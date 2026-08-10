import { useState } from 'react'
import type { ProfileId } from './types'
import { useStore } from './state/store'
import ProfilePicker from './components/ProfilePicker'
import AppHeader from './components/AppHeader'
import KidDashboard from './components/kid/KidDashboard'
import ParentDashboard from './components/parent/ParentDashboard'

export default function App() {
  const { state } = useStore()
  const [profile, setProfile] = useState<ProfileId | null>(null)

  if (profile === null) {
    return <ProfilePicker onPick={setProfile} />
  }

  if (profile === 'parent') {
    return (
      <div className="min-h-full pb-16">
        <AppHeader emoji="🧑‍💼" name="Parent" colour="#4f46e5" onSwitch={() => setProfile(null)} />
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
