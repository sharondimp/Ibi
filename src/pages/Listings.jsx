import React, { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, doc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { computeMatch } from '../utils/matching'
import ListingCard from '../components/ListingCard'

export default function Listings() {
  const { user, profile } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [applications, setApplications] = useState({}) // opportunityId -> status
  const [filters, setFilters] = useState({ type: '', mode: '', location: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'opportunities'), (snap) => {
      setOpportunities(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'applications'), where('studentId', '==', user.uid))
    getDocs(q).then((snap) => {
      const map = {}
      snap.docs.forEach((d) => { map[d.data().opportunityId] = d.data().status })
      setApplications(map)
    })
  }, [user])

  const enriched = useMemo(() => {
    return opportunities
      .map((op) => ({ op, match: profile ? computeMatch(profile, op) : null }))
      .filter(({ op }) => (!filters.type || op.type === filters.type))
      .filter(({ op }) => (!filters.mode || op.mode === filters.mode))
      .filter(({ op }) => (!filters.location || (op.location || '').toLowerCase().includes(filters.location.toLowerCase())))
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
  }, [opportunities, profile, filters])

  async function handleSave(op) {
    if (!user) return
    await setDoc(doc(db, 'applications', `${user.uid}_${op.id}`), {
      studentId: user.uid,
      opportunityId: op.id,
      orgId: op.orgId || '',
      status: 'saved',
      updatedAt: serverTimestamp(),
    }, { merge: true })
    setApplications((a) => ({ ...a, [op.id]: a[op.id] || 'saved' }))
  }

  async function handleApply(op) {
    if (!user) return
    await setDoc(doc(db, 'applications', `${user.uid}_${op.id}`), {
      studentId: user.uid,
      opportunityId: op.id,
      orgId: op.orgId || '',
      status: 'applied',
      updatedAt: serverTimestamp(),
    }, { merge: true })
    setApplications((a) => ({ ...a, [op.id]: 'applied' }))
  }

  return (
    <div className="px-6 md:px-16 pt-28 pb-24 max-w-5xl mx-auto">
      <div className="eyebrow">Opportunities</div>
      <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-8">
        {profile ? `Matches for ${profile.department}` : 'Internships & SIWES placements'}
      </h1>

      <div className="flex flex-wrap gap-3 mb-8">
        <select className="input !w-auto" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">All types</option>
          <option value="Internship">Internship</option>
          <option value="SIWES">SIWES</option>
        </select>
        <select className="input !w-auto" value={filters.mode} onChange={(e) => setFilters((f) => ({ ...f, mode: e.target.value }))}>
          <option value="">All modes</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>
        <input
          className="input !w-auto"
          placeholder="Filter by location"
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
        />
      </div>

      {!profile && (
        <div className="card mb-8 !bg-gold/10 !border-gold-dim">
          <p className="text-sm">
            <span className="font-semibold">Complete your profile</span> to see eligibility match scores on every listing.
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-paper-dim">Loading opportunities…</p>
      ) : enriched.length === 0 ? (
        <p className="text-paper-dim">No opportunities match your filters yet. Check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {enriched.map(({ op, match }) => (
            <ListingCard
              key={op.id}
              opportunity={op}
              match={match}
              saved={!!applications[op.id]}
              applied={applications[op.id] === 'applied' || ['assessment', 'interview', 'offer'].includes(applications[op.id])}
              onSave={() => handleSave(op)}
              onApply={() => handleApply(op)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
