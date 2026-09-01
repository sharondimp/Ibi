import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [accountType, setAccountType] = useState(null) // 'student' | 'organization'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // Check students first, then organizations — a uid only ever lives in one.
        const studentSnap = await getDoc(doc(db, 'students', firebaseUser.uid))
        if (studentSnap.exists()) {
          setProfile(studentSnap.data())
          setAccountType('student')
        } else {
          const orgSnap = await getDoc(doc(db, 'organizations', firebaseUser.uid))
          if (orgSnap.exists()) {
            setProfile(orgSnap.data())
            setAccountType('organization')
          } else {
            setProfile(null)
            setAccountType(null)
          }
        }
      } else {
        setProfile(null)
        setAccountType(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signup({ name, email, password, department, level, skills, location }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })

    const studentDoc = {
      name,
      email,
      department,
      level,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      location,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'students', cred.user.uid), studentDoc)
    setProfile(studentDoc)
    setAccountType('student')
    return cred.user
  }

  // hasCAC: true/false. cacNumber only used when hasCAC is true.
  // orgType/contactInfo only used when hasCAC is false.
  async function signupOrg({ name, email, password, hasCAC, cacNumber, orgType, contactInfo }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })

    const orgDoc = {
      name,
      email,
      hasCAC,
      cacNumber: hasCAC ? cacNumber : '',
      orgType: hasCAC ? '' : orgType,
      contactInfo: hasCAC ? '' : contactInfo,
      verified: false,
      status: 'pending',
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'organizations', cred.user.uid), orgDoc)
    setProfile(orgDoc)
    setAccountType('organization')
    return cred.user
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    return signOut(auth)
  }

  const value = { user, profile, accountType, loading, signup, signupOrg, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
