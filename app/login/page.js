'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const login = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o password errati')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>⚔️ Campaign Hub</h1>
      <form onSubmit={login}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: 4 }} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Entra
        </button>
      </form>
    </div>
  )
}