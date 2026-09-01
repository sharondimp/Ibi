import React, { useEffect, useState } from 'react'
import { collection, addDoc, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  title: '', org: '', type: 'Internship', location: '', mode: 'On-site',
  stipend: '', accommodation: false, transport: false, duration: '',
  requiredLevel: 'Any', departmentTags: '', skillsWanted: '', deadline: '',
}

export default function Admin() {
  const { profile } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [opportunities, setOpportunities] = useState([])
  const [pendingOrgs, setPendingOrgs] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.isAdmin) return
    const unsub = onSnapshot(collection(db, 'opportunities'), (snap) => {
      setOpportunities(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [profile])

  useEffect(() => {
    if (!profile?.isAdmin) return
    const q = query(collection(db, 'organizations'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => {
      setPendingOrgs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [profile])

  async function handleApprove(orgId) {
    await updateDoc(doc(db, 'organizations', orgId), { verified: true, status: 'approved' })
    // TODO: trigger the verification email here (see note below the form).
  }

  async function handleReject(orgId) {
    await updateDoc(doc(db, 'organizations', orgId), { verified: false, status: 'rejected' })
  }

  if (!profile?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <p className="text-paper-dim">You don't have access to this page.</p>
      </div>
    )
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'opportunities'), {
        ...form,
        departmentTags: form.departmentTags.split(',').map((s) => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(',').map((s) => s.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
      })
      setForm(EMPTY)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'opportunities', id))
  }

  return (
    <div className="px-6 md:px-16 pt-28 pb-24 max-w-5xl mx-auto grid lg:grid-cols-[380px_1fr] gap-8">
      <form onSubmit={handleSubmit} className="card h-fit">
        <div className="eyebrow">Admin</div>
        <h1 className="font-display font-semibold text-xl mb-6">Add an opportunity</h1>

        <div className="space-y-4">
          <Field label="Title"><input className="input" required value={form.title} onChange={(e) => update('title', e.target.value)} /></Field>
          <Field label="Organization"><input className="input" required value={form.org} onChange={(e) => update('org', e.target.value)} /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className="input" value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option>Internship</option>
                <option>SIWES</option>
              </select>
            </Field>
            <Field label="Mode">
              <select className="input" value={form.mode} onChange={(e) => update('mode', e.target.value)}>
                <option>On-site</option>
                <option>Hybrid</option>
                <option>Remote</option>
              </select>
            </Field>
          </div>

          <Field label="Location"><input className="input" placeholder="e.g. Lagos" value={form.location} onChange={(e) => update('location', e.target.value)} /></Field>
          <Field label="Stipend"><input className="input" placeholder="e.g. ₦50,000 / month" value={form.stipend} onChange={(e) => update('stipend', e.target.value)} /></Field>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.accommodation} onChange={(e) => update('accommodation', e.target.checked)} />
              Accommodation
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.transport} onChange={(e) => update('transport', e.target.checked)} />
              Transport
            </label>
          </div>

          <Field label="Duration"><input className="input" placeholder="e.g. 3 months" value={form.duration} onChange={(e) => update('duration', e.target.value)} /></Field>

          <Field label="Required level">
            <select className="input" value={form.requiredLevel} onChange={(e) => update('requiredLevel', e.target.value)}>
              {['Any', '100', '200', '300', '400', '500'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>

          <Field label="Department tags (comma separated)">
            <input className="input" placeholder="e.g. Computer Science, Software Engineering" value={form.departmentTags} onChange={(e) => update('departmentTags', e.target.value)} />
          </Field>
          <Field label="Skills wanted (comma separated)">
            <input className="input" placeholder="e.g. React, Git" value={form.skillsWanted} onChange={(e) => update('skillsWanted', e.target.value)} />
          </Field>
          <Field label="Deadline"><input className="input" type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} /></Field>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-7 disabled:opacity-60">
          {saving ? 'Adding…' : 'Add opportunity'}
        </button>
      </form>

      <div>
        {pendingOrgs.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display font-semibold text-xl mb-5">
              Pending organizations <span className="text-paper-dim font-normal text-base">({pendingOrgs.length})</span>
            </h2>
            <div className="space-y-3">
              {pendingOrgs.map((org) => (
                <div key={org.id} className="card !p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{org.name}</div>
                      <div className="text-xs text-paper-dim mt-0.5">{org.email}</div>
                      {org.hasCAC ? (
                        <div className="text-xs text-paper-dim mt-1">CAC: {org.cacNumber}</div>
                      ) : (
                        <>
                          <div className="text-xs text-paper-dim mt-1">No CAC · {org.orgType}</div>
                          <div className="text-xs text-paper-dim">Verify via: {org.contactInfo}</div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleApprove(org.id)} className="btn-secondary !py-2 !px-3 !text-xs">
                        Approve
                      </button>
                      <button onClick={() => handleReject(org.id)} className="text-coral text-xs font-mono">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="font-display font-semibold text-xl mb-5">
          Live opportunities <span className="text-paper-dim font-normal text-base">({opportunities.length})</span>
        </h2>
        <div className="space-y-3">
          {opportunities.map((op) => (
            <div key={op.id} className="card !p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{op.title}</div>
                <div className="text-xs text-paper-dim mt-0.5">{op.org} · {op.type} · {op.location}</div>
              </div>
              <button onClick={() => handleDelete(op.id)} className="text-coral text-xs font-mono">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
