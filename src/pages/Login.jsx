import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await login(email, password)
      // Check which collection this uid belongs to, so orgs land on their
      // status page instead of the student listings page.
      const orgSnap = await getDoc(doc(db, 'organizations', cred.user.uid))
      navigate(orgSnap.exists() ? '/org-dashboard' : '/listings')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm">
        <div className="eyebrow">Welcome back</div>
        <h1 className="font-display font-semibold text-2xl mb-7">Log in to Ibi</h1>

        <div className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-coral text-sm mt-4">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-7 disabled:opacity-60">
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-center text-sm text-paper-dim mt-5">
          New to Ibi? <Link to="/signup" className="text-gold">Create an account</Link>
        </p>
      </form>
    </div>
  )
}
