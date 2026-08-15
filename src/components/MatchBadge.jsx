import React from 'react'

export default function MatchBadge({ score, reasons = [] }) {
  const color = score >= 70 ? 'text-leaf' : score >= 40 ? 'text-gold' : 'text-coral'

  return (
    <div className="text-right">
      <div className={`font-display font-bold text-2xl ${color}`}>{score}%</div>
      {reasons.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5 mt-2 max-w-[180px]">
          {reasons.slice(0, 3).map((r, i) => (
            <span
              key={i}
              className="font-mono text-[10px] px-2 py-1 rounded-full bg-leaf/10 text-leaf whitespace-nowrap"
            >
              ✓ {r}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
