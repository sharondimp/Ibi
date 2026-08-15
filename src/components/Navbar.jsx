import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-gold' : 'text-paper-dim hover:text-paper'
    }`

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-ink-950/95 backdrop-blur border-b border-white/5">
      <Link to="/" className="font-display font-bold text-xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_12px_#E8A33D]" />
        ibi
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <NavLink to="/listings" className={linkClass}>Opportunities</NavLink>
        {user && <NavLink to="/tracker" className={linkClass}>Tracker</NavLink>}
        {user && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden sm:inline text-xs font-mono text-paper-dim">
              {profile?.name || user.email}
            </span>
            <button onClick={handleLogout} className="btn-secondary !py-2 !px-4 !text-xs">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-paper-dim hover:text-paper">
              Log in
            </Link>
            <Link to="/signup" className="btn-secondary !py-2 !px-4 !text-xs">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
