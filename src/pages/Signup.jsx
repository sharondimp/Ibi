import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEPARTMENTS = [
  'Fisheries & Aquaculture', 'Marine Science', 'Computer Science', 'Mass Communication',
  'Accounting', 'Business Administration', 'Economics', 'Law', 'Medicine',
  'Electrical Engineering', 'Civil Engineering', 'Chemistry', 'Biochemistry',
  'English', 'Political Science', 'Other',
]
const LEVELS = ['100', '200', '300', '400', '500']

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    department: '', level: '300', skills: '', location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      navigate('/listings')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <form onSubmit={handleSubmit} className="card w-full max-w-md">
        <div className="eyebrow">Create your profile</div>
        <h1 className="font-display font-semibold text-2xl mb-1">Join Ibi</h1>
        <p className="text-paper-dim text-sm mb-7">
          One profile powers every match, filter, and alert.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department</label>
              <select className="input" required value={form.department} onChange={(e) => update('department', e.target.value)}>
                <option value="" disabled>Select</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={(e) => update('level', e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l} level</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Skills (comma separated)</label>
            <input className="input" placeholder="e.g. React, Excel, Data analysis" value={form.skills} onChange={(e) => update('skills', e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="e.g. Lagos" required value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
        </div>

        {error && <p className="text-coral text-sm mt-4">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-7 disabled:opacity-60">
          {loading ? 'Creating profile…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-paper-dim mt-5">
          Already have an account? <Link to="/login" className="text-gold">Log in</Link>
        </p>
      </form>
    </div>
  )
}
