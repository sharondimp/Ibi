import React from 'react'
import MatchBadge from './MatchBadge'

export default function ListingCard({ opportunity, match, onSave, onApply, saved, applied }) {
  const {
    title,
    org,
    location,
    stipend,
    accommodation,
    transport,
    duration,
    mode,
    requiredLevel,
    deadline,
    type,
  } = opportunity

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-paper-dim">
            {type}
          </span>
          <h3 className="font-display font-semibold text-lg mt-1">{title}</h3>
          <p className="text-sm text-paper-dim mt-0.5">{org}</p>
        </div>
        {match && <MatchBadge score={match.score} reasons={match.reasons} />}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5 pt-5 border-t border-white/10 text-sm">
        <Item k="Stipend" v={stipend || 'Unpaid'} />
        <Item k="Location" v={location} />
        <Item k="Accommodation" v={accommodation ? 'Provided' : 'Not provided'} />
        <Item k="Transport" v={transport ? 'Provided' : 'Not provided'} />
        <Item k="Duration" v={duration} />
        <Item k="Mode" v={mode} />
        <Item k="Level" v={requiredLevel} />
        <Item k="Deadline" v={deadline} />
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onSave}
          className={`btn-secondary !py-2 !px-4 !text-xs ${saved ? '!border-gold !text-gold' : ''}`}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={onApply}
          disabled={applied}
          className="btn-primary !py-2 !px-4 !text-xs disabled:opacity-50"
        >
          {applied ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  )
}

function Item({ k, v }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-paper-dim mb-1">{k}</div>
      <div className="font-medium">{v || '—'}</div>
    </div>
  )
}
