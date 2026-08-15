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

- `students/{uid}` — name, email, department, level, skills[], location
- `opportunities/{id}` — title, org, type (Internship/SIWES), location, mode,
  stipend, accommodation, transport, duration, requiredLevel, departmentTags[],
  skillsWanted[], deadline
- `applications/{studentId_opportunityId}` — studentId, opportunityId, status
  (saved → applied → assessment → interview → offer/rejected)

## Seeding your first listings

There's no scraper for MVP — go to `/admin` while logged in and add opportunities
manually. That's expected for now; the admin dashboard is intentionally simple
so you can seed real UNILAG-relevant listings yourself before opening it up.

## What's intentionally left out of this MVP

- NYSC-related features (primary posting is automatic; PPA search is a different,
  messier flow — revisit as its own feature later, not lumped in with "apply")
- CV matching (Groq API) and opportunity alerts — add once the core loop
  (profile → match → apply → track) is validated with real users
- Admin role-gating on Firestore rules — currently any authenticated user can
  write to `opportunities`. Fine while you're the only one seeding data; tighten
  with an `isAdmin` flag on your own student doc before wider launch.

## Design system

Colors, type, and the route-spine motif live in `tailwind.config.js` and
`src/index.css`. The spine on the Home page tracks scroll progress and mirrors
the real application tracker stages (Saved → Applied → Assessment → Interview → Offer) —
keep that consistency if you extend the landing page further.
