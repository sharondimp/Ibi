import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STOPS = [
  { id: 'hero', label: 'Start' },
  { id: 'how', label: 'Applied' },
  { id: 'features', label: 'Assessment' },
  { id: 'listing', label: 'Interview' },
  { id: 'cta', label: 'Offer' },
]

export default function Home() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const docHeight = document.body.scrollHeight - window.innerHeight
      setProgress(Math.min(100, (window.scrollY / docHeight) * 100))

      let idx = 0
      STOPS.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) idx = i
      })
      setActiveIdx(idx)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative">
      {/* Route spine */}
      <div className="hidden md:block fixed left-7 top-0 bottom-0 w-px z-10">
        <div className="absolute inset-0 bg-white/10" />
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-gold to-leaf transition-all duration-100"
          style={{ height: `${progress}%` }}
        />
        {STOPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => document.getElementById(s.id).scrollIntoView({ behavior: 'smooth' })}
            className="absolute -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all"
            style={{
              top: `${(i / (STOPS.length - 1)) * 90 + 2}%`,
              borderColor: i === activeIdx ? '#E8A33D' : '#CBC4B2',
              background: i === activeIdx ? '#E8A33D' : '#1C2C58',
              boxShadow: i === activeIdx ? '0 0 0 5px rgba(232,163,61,0.18)' : 'none',
            }}
          >
            <span
              className={`absolute left-5 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-wide whitespace-nowrap transition-opacity ${
                i === activeIdx ? 'opacity-100 text-gold' : 'opacity-0'
              }`}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>

      <section id="hero" className="min-h-screen flex flex-col justify-center px-6 md:pl-24 pt-32 pb-24 max-w-4xl">
        <div className="eyebrow">For Nigerian university students</div>
        <h1 className="font-display font-bold text-[42px] sm:text-6xl md:text-7xl leading-none tracking-tight">
          Find your <span className="text-gold">place.</span>
        </h1>
        <p className="mt-7 text-lg text-paper-dim max-w-lg leading-relaxed">
          Ibi matches you to internships and SIWES placements you're actually eligible for —
          with the stipend, location, and accommodation details upfront. Every department, every faculty.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-10">
          <Link to="/signup" className="btn-primary">Join the waitlist →</Link>
          <a href="#how" className="btn-secondary">See how it works</a>
        </div>

        <div className="card max-w-sm mt-14">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-semibold">Frontend Developer Intern</div>
              <div className="text-sm text-paper-dim mt-0.5">Paystack</div>
            </div>
            <div className="font-display font-bold text-2xl text-leaf">92%</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['300 level', 'Computer Science', 'Lagos', '3-month placement'].map((t) => (
              <span key={t} className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-leaf/10 text-leaf">
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 md:pl-24 md:pr-16 py-24 max-w-4xl">
        <div className="eyebrow">The journey</div>
        <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight max-w-xl mb-4">
          From "where do I even start" to offer letter.
        </h2>
        <p className="text-paper-dim max-w-lg mb-14 leading-relaxed">
          Most students lose weeks scrolling scattered WhatsApp groups and outdated job boards.
          Ibi turns that into a straight line.
        </p>

        {[
          ['01', 'Build your profile', "Course, department, level, skills, and location — once. This is what powers every match after."],
          ['02', 'Get matched, not overwhelmed', "Ibi shows you opportunities ranked by eligibility, with the exact reasons you qualify — no scrolling through hundreds you can't apply to."],
          ['03', 'Apply with full information', 'Stipend, accommodation, transport allowance, and deadline are on every listing before you apply — not a surprise after.'],
          ['04', 'Track every stage', 'Saved, applied, assessment, interview, offer — know exactly where you stand with every opportunity, in one place.'],
        ].map(([num, title, body], i, arr) => (
          <div
            key={num}
            className={`grid grid-cols-[50px_1fr] gap-5 py-7 border-t border-white/10 ${
              i === arr.length - 1 ? 'border-b' : ''
            }`}
          >
            <div className="font-mono text-sm text-gold pt-1">{num}</div>
            <div>
              <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
              <p className="text-paper-dim text-[15px] leading-relaxed max-w-lg">{body}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="features" className="px-6 md:pl-24 md:pr-16 py-24 max-w-4xl">
        <div className="eyebrow">What makes Ibi different</div>
        <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight max-w-xl mb-4">
          Built for the questions students actually ask.
        </h2>
        <p className="text-paper-dim max-w-lg mb-14 leading-relaxed">
          Not another listings dump. Every feature exists because a real placement search needs it.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['🎯', 'Eligibility matching', 'See a match score and the exact reasons behind it — level, department, and location — before you spend time applying.'],
            ['💰', 'Full transparency', 'Stipend, accommodation, transport, duration, and mode shown on every listing. No digging through comments to find the real details.'],
            ['📋', 'Application tracker', 'Move opportunities through saved, applied, assessment, interview, and offer — so nothing falls through the cracks.'],
            ['🔔', 'Opportunity alerts', "Get notified when new placements match your department and location — you don't have to go looking every week."],
          ].map(([icon, title, body]) => (
            <div key={title} className="card hover:border-gold-dim hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-[10px] bg-gold/10 flex items-center justify-center text-lg mb-4">
                {icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{title}</h3>
              <p className="text-paper-dim text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="listing" className="px-6 md:pl-24 md:pr-16 py-24 max-w-4xl">
        <div className="eyebrow">Every listing, in full</div>
        <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight max-w-xl mb-4">
          Everything you need to decide, before you apply.
        </h2>
        <p className="text-paper-dim max-w-lg mb-14 leading-relaxed">
          No more messaging ten people to ask "is accommodation provided sef."
        </p>

        <div className="card max-w-md">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="font-display font-semibold text-lg">Marketing SIWES Intern</div>
              <div className="text-sm text-paper-dim mt-1">MTN Nigeria</div>
            </div>
            <span className="font-mono text-[11px] text-coral border border-coral/35 px-2.5 py-1 rounded-full whitespace-nowrap">
              Closes in 6 days
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 pt-5 border-t border-white/10">
            {[
              ['Stipend', '₦50,000 / month'],
              ['Location', 'Ikoyi, Lagos'],
              ['Accommodation', 'Not provided'],
              ['Transport', 'Provided'],
              ['Duration', '6 months'],
              ['Mode', 'Hybrid'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="font-mono text-[10px] uppercase tracking-wide text-paper-dim mb-1">{k}</div>
                <div className="text-sm font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <div className="eyebrow">Your pipeline, at a glance</div>
          <div className="flex gap-2.5 overflow-x-auto pb-3">
            {[
              ['Saved', 'Accounting Intern — KPMG', false],
              ['Applied', 'Marketing SIWES — MTN Nigeria', true],
              ['Assessment', 'Data Analyst Intern — Flutterwave', false],
              ['Interview', 'Reporter Intern — Channels TV', false],
              ['Offer', '—', false],
            ].map(([stage, item, current]) => (
              <div
                key={stage}
                className={`min-w-[150px] card !p-3.5 ${current ? '!border-gold-dim' : ''}`}
              >
                <h4 className={`font-mono text-[11px] uppercase tracking-wide mb-2.5 ${current ? 'text-gold' : 'text-paper-dim'}`}>
                  {stage}
                </h4>
                <div className="bg-ink-800 rounded-lg p-2.5 text-[12.5px] font-medium leading-snug">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="px-6 md:pl-24 md:pr-16 pt-24 pb-40 max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-10 md:p-14">
          <span className="absolute -right-3 -bottom-10 font-display font-bold text-[180px] text-white/[0.03] leading-none pointer-events-none select-none">
            IBI
          </span>
          <div className="eyebrow">Starting at UNILAG</div>
          <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight max-w-md mb-3.5">
            Be first through the door.
          </h2>
          <p className="text-paper-dim max-w-md mb-8">
            Ibi is launching with UNILAG students first. Join the waitlist and get early access
            before we open applications and listings.
          </p>
          <Link to="/signup" className="btn-primary">Join the waitlist →</Link>
        </div>
      </section>

      <footer className="px-6 md:pl-24 md:pr-16 py-10 max-w-4xl flex justify-between items-center border-t border-white/10 text-paper-dim text-sm">
        <div className="font-display font-bold text-base flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          ibi
        </div>
        <div>Find your place.</div>
      </footer>
    </div>
  )
}
