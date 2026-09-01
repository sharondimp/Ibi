import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ORG_TYPES = ['University Department', 'NGO', 'Individual / Small Business', 'Other']

export default function OrgSignup() {
  const { signupOrg } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    hasCAC: true, cacNumber: '',
    orgType: '', contactInfo: '',
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
      await signupOrg(form)
      navigate('/org-dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <form onSubmit={handleSubmit} className="card w-full max-w-md">
        <div className="eyebrow">For organizations</div>
        <h1 className="font-display font-semibold text-2xl mb-1">Post on Ibi</h1>
        <p className="text-paper-dim text-sm mb-7">
          Every organization is verified before listings go live, so students can trust what they see.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">Organization name</label>
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

          <div>
            <label className="label">Do you have a CAC registration number?</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => update('hasCAC', true)}
                className={`input flex-1 text-sm ${form.hasCAC ? 'border-gold text-gold' : ''}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => update('hasCAC', false)}
                className={`input flex-1 text-sm ${!form.hasCAC ? 'border-gold text-gold' : ''}`}
              >
                No
              </button>
            </div>
          </div>

          {form.hasCAC ? (
            <div>
              <label className="label">CAC registration number</label>
              <input
                className="input"
                placeholder="e.g. RC1234567"
                required
                value={form.cacNumber}
                onChange={(e) => update('cacNumber', e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="label">Organization type</label>
                <select className="input" required value={form.orgType} onChange={(e) => update('orgType', e.target.value)}>
                  <option value="" disabled>Select</option>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">How can students verify this is real?</label>
                <input
                  className="input"
                  placeholder="e.g. department head's name, phone number, LinkedIn page"
                  required
                  value={form.contactInfo}
                  onChange={(e) => update('contactInfo', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="text-coral text-sm mt-4">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-7 disabled:opacity-60">
          {loading ? 'Submitting…' : 'Submit for verification'}
        </button>

        <p className="text-center text-sm text-paper-dim mt-5">
          Already verified? <Link to="/login" className="text-gold">Log in</Link>
        </p>
      </form>
    </div>
  )
}
