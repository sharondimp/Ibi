import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const STAGES = ['saved', 'applied', 'shortlisted', 'assessment', 'interview', 'offer', 'rejected']
const STAGE_LABELS = {
  saved: 'Saved', applied: 'Applied', shortlisted: 'Shortlisted', assessment: 'Assessment',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

export default function Tracker() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [opportunities, setOpportunities] = useState({})

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'applications'), where('studentId', '==', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setApplications(apps)

      const missing = apps.filter((a) => !opportunities[a.opportunityId])
      for (const a of missing) {
        const opSnap = await getDoc(doc(db, 'opportunities', a.opportunityId))
        if (opSnap.exists()) {
          setOpportunities((prev) => ({ ...prev, [a.opportunityId]: opSnap.data() }))
        }
      }
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function moveStage(appId, newStatus) {
    await updateDoc(doc(db, 'applications', appId), { status: newStatus })
  }

  return (
    <div className="px-6 md:px-16 pt-28 pb-24 max-w-6xl mx-auto">
      <div className="eyebrow">Your pipeline</div>
      <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-10">Application tracker</h1>

      {applications.length === 0 ? (
        <p className="text-paper-dim">
          Nothing here yet. Save or apply to an opportunity from the listings page to start tracking it.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div key={stage} className="min-w-[240px] flex-1">
              <h3 className="font-mono text-xs uppercase tracking-wide text-paper-dim mb-3">
                {STAGE_LABELS[stage]}
                <span className="ml-2 text-gold">
                  {applications.filter((a) => a.status === stage).length}
                </span>
              </h3>
              <div className="space-y-3">
                {applications
                  .filter((a) => a.status === stage)
                  .map((a) => {
                    const op = opportunities[a.opportunityId]
                    return (
                      <div key={a.id} className="card !p-4">
                        <div className="font-medium text-sm mb-1">{op?.title || 'Loading…'}</div>
                        <div className="text-xs text-paper-dim mb-3">{op?.org}</div>
                        <select
                          className="input !py-1.5 !text-xs"
                          value={a.status}
                          onChange={(e) => moveStage(a.id, e.target.value)}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
