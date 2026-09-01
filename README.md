# Ibi — Find your place

A Nigerian student opportunity platform. MVP scope: internships + SIWES placements,
with eligibility matching, full listing transparency, and an application tracker.

## Stack
- React 18 + Vite
- React Router
- Tailwind CSS
- Firebase (Auth + Firestore)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Firebase project at console.firebase.google.com, enable:
   - Authentication → Email/Password
   - Firestore Database

3. Copy your Firebase config into `src/firebase.js` (replace the placeholder values),
   or use `.env` with the `VITE_FIREBASE_*` variables in `.env.example` and switch
   `src/firebase.js` to read from `import.meta.env`.

4. Deploy the security rules in `firestore.rules` to your Firestore instance
   (Firebase console → Firestore → Rules, or `firebase deploy --only firestore:rules`
   if you have the CLI set up).

5. Run locally:
   ```
   npm run dev
   ```

6. Deploy: push to GitHub, connect the repo on Netlify or Vercel like you already do
   for your other projects. Build command `npm run build`, output directory `dist`.

## Data model

- `students/{uid}` — name, email, department, level, skills[], location, isAdmin (bool, admin only)
- `organizations/{uid}` — name, email, hasCAC, cacNumber (if hasCAC), orgType +
  contactInfo (if not hasCAC), verified (bool), status ('pending' | 'approved' | 'rejected')
- `opportunities/{id}` — title, org, orgId (owning org's uid, absent on admin-posted
  ones), type (Internship/SIWES), location, mode, stipend, accommodation, transport,
  duration, requiredLevel, departmentTags[], skillsWanted[], deadline
- `applications/{studentId_opportunityId}` — studentId, opportunityId, orgId
  (owning org's uid, '' for admin-posted opportunities), status
  (saved → applied → shortlisted → assessment → interview → offer/rejected)

## Making yourself admin (do this once)

Firestore rules now require `isAdmin: true` on your own student doc to access
`/admin` or write opportunities as admin. To set it:
1. Sign up (or log in) as a student on the live site once
2. Firebase console → Firestore Database → `students` collection → your document
3. Add a field: `isAdmin` (boolean) → `true`

Without this, `/admin` will show "You don't have access to this page."

## Organization signup, verification, and self-serve posting

Organizations sign up at `/org-signup` — they pick whether they have a CAC number
(then just enter it) or not (then pick an org type and give a way to verify them,
e.g. a contact name or LinkedIn). Either way they land in `organizations` as
`status: 'pending'`, `verified: false`, and logging in takes them to
`/org-dashboard`, which shows a "pending, up to 24 hours" screen until you act.

As admin, `/admin` shows a **Pending organizations** panel above the listings
form — Approve or Reject each one. Approving sets `verified: true`.

Once verified, `/org-dashboard` unlocks: the org can post opportunities directly
(self-serve — no per-listing approval from you), see only their own listings, and
expand any listing to see who's applied (name, department, level, skills) with a
dropdown to mark each applicant Applied / Shortlisted / Interview / Offer /
Rejected. They can only ever see or edit their own listings and applicants —
enforced in `firestore.rules`, not just hidden in the UI.

Since self-serve skips a per-listing review, keep an eye on `/admin`'s "Live
opportunities" list occasionally to spot-check what's going live — it shows every
opportunity, admin- and org-posted alike.

**Not yet wired up: the verification email.** Approving an org currently only
updates Firestore — it does not send anything. You already use EmailJS elsewhere,
so the straightforward path is calling `emailjs.send(...)` inside `handleApprove`
in `Admin.jsx` with your EmailJS service ID, a "you're verified" template, and the
org's email/name as template params. Until that's wired in, email them manually
after approving.

## Seeding your first listings

There's no scraper for MVP — go to `/admin` while logged in as an admin and add
opportunities manually. That's expected for now; the admin dashboard is
intentionally simple so you can seed real UNILAG-relevant listings yourself
before opening it up.

## What's intentionally left out of this MVP

- NYSC-related features (primary posting is automatic; PPA search is a different,
  messier flow — revisit as its own feature later, not lumped in with "apply")
- CV matching (Groq API) and opportunity alerts — add once the core loop
  (profile → match → apply → track) is validated with real users
- Automatic verification emails to orgs (see "Organization signup, verification,
  and self-serve posting" above)
- Per-listing admin review for org-posted opportunities (they go live immediately
  once an org is verified — spot-check via `/admin` instead)

## Design system

Colors, type, and the route-spine motif live in `tailwind.config.js` and
`src/index.css`. The spine on the Home page tracks scroll progress and mirrors
the real application tracker stages (Saved → Applied → Assessment → Interview → Offer) —
keep that consistency if you extend the landing page further.
