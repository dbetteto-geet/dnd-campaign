'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile) return <div style={{ padding: '2rem' }}>Caricamento...</div>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Benvenuto, {profile.username}!</h1>
      <p>Ruolo: {profile.role === 'dm' ? '🎲 Dungeon Master' : '⚔️ Giocatore'}</p>
      <p style={{ color: '#888' }}>
        Qui andrà l'app completa. Per ora tutto funziona!
        <br />Incolla qui il componente React che ti ho fornito.
      </p>
      <button onClick={logout} style={{ marginTop: '1rem', padding: '8px 16px', cursor: 'pointer' }}>
        Esci
      </button>
    </div>
  )
}