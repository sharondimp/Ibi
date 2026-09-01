import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, addDoc, onSnapshot, serverTimestamp, deleteDoc, doc,
  updateDoc, getDoc, query, where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  title: '', type: 'Internship', location: '', mode: 'On-site',
  stipend: '', accommodation: false, transport: false, duration: '',
  requiredLevel: 'Any', departmentTags: '', skillsWanted: '', deadline: '',
}

const APPLICANT_STAGES = ['applied', 'shortlisted', 'interview', 'offer', 'rejected']
const STAGE_LABELS = {
  saved: 'Saved', applied: 'Applied', shortlisted: 'Shortlisted',
  assessment: 'Assessment', interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

export default function OrgDashboard() {
  const { user, profile, accountType, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [listings, setListings] = useState([])
  const [applications, setApplications] = useState([])
  const [studentCache, setStudentCache] = useState({})
  const [expandedListing, setExpandedListing] = useState(null)

  const verified = profile?.verified

  useEffect(() => {
    if (!user || !verified) return
    const q = query(collection(db, 'opportunities'), where('orgId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user, verified])

  useEffect(() => {
    if (!user || !verified) return
    const q = query(collection(db, 'applications'), where('orgId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      setApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user, verified])

  // Fetch student profiles for anyone who's applied, once each, cached.
  useEffect(() => {
    const missing = applications.filter((a) => !studentCache[a.studentId])
    missing.forEach(async (a) => {
      const snap = await getDoc(doc(db, 'students', a.studentId))
      if (snap.exists()) {
        setStudentCache((prev) => ({ ...prev, [a.studentId]: snap.data() }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications])

  const applicantsByListing = useMemo(() => {
    const map = {}
    applications
      .filter((a) => a.status !== 'saved') // orgs see applicants, not students who just bookmarked
      .forEach((a) => {
        if (!map[a.opportunityId]) map[a.opportunityId] = []
        map[a.opportunityId].push(a)
      })
    return map
  }, [applications])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'opportunities'), {
        ...form,
        org: profile.name,
        orgId: user.uid,
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

  async function handleStageChange(applicationId, newStatus) {
    await updateDoc(doc(db, 'applications', applicationId), { status: newStatus })
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  if (accountType !== 'organization') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <p className="text-paper-dim">This page is for organization accounts.</p>
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="card w-full max-w-md text-center">
          <div className="eyebrow">Pending verification</div>
          <h1 className="font-display font-semibold text-2xl mb-3">You&rsquo;re on the list</h1>
          <p className="text-paper-dim text-sm mb-2">
            Thanks for signing up, {profile?.name}. We review every organization before listings go live —
            this usually takes up to 24 hours.
          </p>
          <p className="text-paper-dim text-sm mb-7">
            You'll get an email at <span className="text-paper">{profile?.email}</span> once you're verified.
          </p>
          <button onClick={handleLogout} className="btn-primary w-full justify-center">Log out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 md:px-16 pt-28 pb-24 max-w-5xl mx-auto grid lg:grid-cols-[380px_1fr] gap-8">
      <form onSubmit={handleSubmit} className="card h-fit">
        <div className="eyebrow">{profile.name}</div>
        <h1 className="font-display font-semibold text-xl mb-6">Post an opportunity</h1>

        <div className="space-y-4">
          <Field label="Title"><input className="input" required value={form.title} onChange={(e) => update('title', e.target.value)} /></Field>

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
          {saving ? 'Posting…' : 'Post opportunity'}
        </button>
      </form>

      <div>
        <h2 className="font-display font-semibold text-xl mb-5">
          Your listings <span className="text-paper-dim font-normal text-base">({listings.length})</span>
        </h2>

        {listings.length === 0 ? (
          <p className="text-paper-dim text-sm">No listings yet — post your first one from the form.</p>
        ) : (
          <div className="space-y-3">
            {listings.map((op) => {
              const applicants = applicantsByListing[op.id] || []
              const isOpen = expandedListing === op.id
              return (
                <div key={op.id} className="card !p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedListing(isOpen ? null : op.id)}
                      className="text-left flex-1"
                    >
                      <div className="font-medium text-sm">{op.title}</div>
                      <div className="text-xs text-paper-dim mt-0.5">
                        {op.type} · {op.location} · {applicants.length} applicant{applicants.length === 1 ? '' : 's'}
                      </div>
                    </button>
                    <button onClick={() => handleDelete(op.id)} className="text-coral text-xs font-mono shrink-0 ml-3">
                      Remove
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      {applicants.length === 0 ? (
                        <p className="text-paper-dim text-xs">No applicants yet.</p>
                      ) : (
                        applicants.map((a) => {
                          const student = studentCache[a.studentId]
                          return (
                            <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                              <div>
                                <div className="font-medium">{student?.name || 'Loading…'}</div>
                                <div className="text-xs text-paper-dim">
                                  {student?.department} · {student?.level} level
                                  {student?.skills?.length ? ` · ${student.skills.join(', ')}` : ''}
                                </div>
                              </div>
                              <select
                                className="input !w-auto !py-1.5 !text-xs shrink-0"
                                value={a.status}
                                onChange={(e) => handleStageChange(a.id, e.target.value)}
                              >
                                {APPLICANT_STAGES.map((s) => (
                                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                                ))}
                              </select>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
