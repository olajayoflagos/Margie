# Margie's — revamp notes

This is your project with the architecture/security/SEO fixes applied. Nothing
was deployed — you still need to do that from your own machine with your own
Firebase/Paystack credentials. Steps below, in order.

## 1. Rotate what was exposed
`ca.crt`, `ca.key`, `cert.crt`, `cert.key` were committed to the repo and have
been removed from this copy. If this repo (or any past commit of it) was ever
pushed anywhere - GitHub, a client, a zip you shared - **those keys must be
considered compromised**. Regenerate/reissue them and scrub them from git
history (`git filter-repo` or BFG Repo-Cleaner), not just delete-and-commit.

## 2. Install the new dependencies
```
npm install
```
This pulls in `react-helmet-async` (per-page SEO tags) and `react-quill-new`
(the article editor). Note: the original `react-quill` doesn't work cleanly
with React 19 (it relies on `findDOMNode`, which React 19 removed) - I used
the `react-quill-new` community fork instead. If you hit editor bugs, swap in
TipTap (`@tiptap/react`), which is more actively maintained; I can help wire
that in if needed.

## 3. Deploy Firestore + Storage rules
```
firebase deploy --only firestore:rules,storage
```
The old rules allowed anyone to read/write everything. The new rules require
a real Firebase Auth login for bookings, and an `admin` custom claim for
anything admin-only.

## 4. Set the Paystack secret key (server-side only)
Get your **secret** key (not the public `pk_live_...` one already in the
code) from the Paystack dashboard, then:
```
firebase functions:config:set paystack.secret_key="sk_live_xxxxxxxxxxxx"
```
This is what lets `verifyPaystackPayment` actually confirm a payment happened
before a booking is marked confirmed - the old flow trusted the browser.

## 5. Deploy the Cloud Functions
```
firebase deploy --only functions
```
Functions now live only in `functions/index.js` (the stray duplicate at the
project root is gone). Deployed functions: `checkAvailability`,
`verifyPaystackPayment`, `fetchMyBookings`, `cancelBooking`,
`notifyOnNewBooking`.

## 6. Grant yourself the admin claim
```
node scripts/setAdminClaim.cjs /path/to/serviceAccountKey.json <your-uid>
```
Get the service account key from Firebase Console → Project Settings →
Service Accounts → Generate new private key. Keep it outside the repo. Log
out and back in on the site afterwards for the claim to take effect. `/admin`
now actually checks this instead of a hardcoded UID string that was never
even wired up.

## 7. Seed the `rooms` collection in Firestore
`CheckAvailability.jsx` and the Cloud Functions read room price/availability
from a Firestore `rooms` collection (not from `src/data/rooms.js`, which only
drives the public room pages/cards). Add one document per room, matching the
`id`s in `src/data/rooms.js` (`apartment`, `diamond`, `emerald`, `onyx`,
`bronzite`), each with at least `{ name, price, available: true }`.

## 8. Build and deploy the site
```
npm run build
```
`prebuild` now auto-generates `public/sitemap.xml` (static routes + every
room page). To also include blog articles in the sitemap at build time, set
`GOOGLE_APPLICATION_CREDENTIALS` to a service account key path in your build
environment - otherwise it just builds the sitemap without them, which is
fine, it's still correct, just not exhaustive until you do that.

Then deploy `dist/` to Vercel as before.

## What changed, by area

**Security**
- `firestore.rules` / `storage.rules`: rewritten from "anyone can read/write
  everything" to role-based rules.
- `/admin` is now behind `ProtectedAdminRoute`, which checks a real Firebase
  custom claim (`AdminLogin.jsx` previously existed but was never imported
  anywhere, so `/admin` had zero protection).
- Bookings are only ever marked `confirmed` by `verifyPaystackPayment`, a
  Cloud Function that verifies the transaction with Paystack's API and
  recomputes the price server-side. The client can no longer write a fake
  "paid" booking.
- Removed the two functions codebases silently disagreeing with each other
  (root `index.js` was never even deployed).
- Removed the committed private key/cert files.
- Removed dead code: `BookingForm.jsx` (a second booking flow with no
  payment step at all, unused), `Header.jsx` (unused).

**SEO / GEO**
- Every room now has its own page at `/rooms/:slug` with unique
  title/description/OG tags (`Seo.jsx`) and `HotelRoom` + `BreadcrumbList`
  JSON-LD schema.
- Homepage carries `LodgingBusiness` schema.
- `robots.txt` and a generated `sitemap.xml` now exist (`/admin`,
  `/my-bookings`, `/login`, `/signup`, `/reset-password` are disallowed).
- `src/data/rooms.js` is now the single source of truth for room content, so
  the homepage cards and the room pages can't drift out of sync.

**Content / CMS**
- New Firestore `articles` collection + Storage-backed image uploads.
- Public `/blog` and `/blog/:slug` pages with `BlogPosting` schema.
- Admin dashboard gained an "Articles" tab: title/slug/excerpt/cover image +
  a rich-text body editor (headings, bold/italic, links, lists, and image
  upload straight into the editor), with draft/publish states.

## Still worth doing (bigger projects, didn't touch these)
- **Server-rendering the room/blog pages.** This is still a client-rendered
  SPA - `Seo.jsx` sets the right tags in the browser, but a crawler that
  doesn't execute JavaScript sees the same static `index.html` for every
  route until you add build-time prerendering or move to a framework with
  SSR/SSG (Next.js, Astro, or a Vite prerender plugin). Happy to scope that
  migration next if you want it.
- Sanitizing article HTML before rendering (`dangerouslySetInnerHTML` in
  `BlogPost.jsx`) with something like DOMPurify - lower risk since only an
  admin account can write articles, but worth adding as defense in depth.
- Real admin email notifications on new bookings/messages (there's a
  `notifyOnNewBooking` trigger stub ready for you to plug a provider into).
