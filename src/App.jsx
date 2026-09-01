import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Listings from './pages/Listings'
import Tracker from './pages/Tracker'
import Admin from './pages/Admin'
import OrgSignup from './pages/OrgSignup'
import OrgDashboard from './pages/OrgDashboard'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/org-signup" element={<OrgSignup />} />
        <Route path="/org-dashboard" element={<OrgDashboard />} />
      </Routes>
    </>
  )
}
