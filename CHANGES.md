# What changed in this pass

## 1. Booking form — guest count and labels
`src/CheckAvailability.jsx`, `src/CheckAvailability.css`

The number-of-guests field was a bare `<input type="number">` showing `1` with a
placeholder that vanished as soon as it had a value, so it just looked like a
stray "1". It is now a labelled dropdown:

> **How many people are lodging?** → `1 guest … 10 guests`
> *Total number of people who will be staying in the room.*

Every other field got a real `<label>` too (name, email, room, check-in,
check-out), the two dates sit side by side on desktop and stack on mobile, and
the total line now reads `Room Onyx · 2 guests · 3 nights — ₦102,000`.

Also fixed while in there: the room `<select>` was storing the whole room object
as a JSON string in its `value`. It now stores the room id, which is what it
should have been.

Change `MAX_GUESTS` at the top of the file if you want a different cap, or swap
it for `selectedRoom.maxGuests` to cap per room.

## 2. Login ↔ Signup cross-links
`src/Login.jsx`, `src/Signup.jsx`, `src/ResetPassword.jsx`, `src/Auth.css`

- Login now ends with **"Don't have an account? Sign up"**
- Signup ends with **"Do you have an account? Log in"**
- Reset password ends with **"Remembered it? Log in"**

The `alert()` popups on password reset are gone — messages now appear inline
above the form. After login, the user is returned to wherever they came from
(so "Book & Pay" → login → back to the booking page).

## 3. Professional error messages
`src/utils/errors.js` (new) + used in Login, Signup, ResetPassword, AdminLogin,
CheckAvailability, MyBookings, Contact form.

Guests were seeing raw SDK text like
`Firebase: Error (auth/invalid-credential).` — that looks broken and it tells
an attacker which half of the login pair was wrong.

`friendlyError(err, fallback)` maps error codes to plain sentences:

| Before | Now |
| --- | --- |
| `Firebase: Error (auth/invalid-credential).` | We couldn't sign you in. Please check your email and password. |
| `Firebase: Error (auth/email-already-in-use).` | An account with this email already exists. Try logging in instead. |
| `Firebase: Error (auth/weak-password)…` | Please choose a stronger password - at least 6 characters. |
| `Login failed` | (code-specific message) |
| `internal` | Something went wrong on our side. Please try again, or contact us if it continues. |

Anything it can't classify falls back to a sentence *you* supply at the call
site, and it scrubs anything containing "firebase", "firestore", `auth/…`, or
stack-trace-looking text. The real error is still logged to the console in dev.

## 4. SEO for the room pages
This was the biggest structural gap. `react-helmet-async` writes the title and
meta tags **after** JavaScript runs. Googlebot can execute JS, but on a delayed
second pass — and Bing, WhatsApp, Facebook, X, LinkedIn and the AI crawlers
don't run JS at all. So every room URL was being served the identical
`index.html` with the title "Margies" and one generic description. Five room
pages that look like duplicate content cannot rank for their own names.

**`scripts/prerender.cjs` (new)** runs automatically after `npm run build`
(`"postbuild"` in package.json). It writes a real static HTML file per route —
`dist/rooms/room-onyx/index.html` and so on — each with its own `<title>`, meta
description, canonical, OG/Twitter tags, JSON-LD, and a readable HTML snapshot
of the page content inside `#root`. React then renders over it, so users notice
nothing, while crawlers get complete HTML on the first request with zero JS.

Verified output for `/rooms/room-onyx`:

```
<title>Room Onyx - Compact ensuite room in Gbagada, Lagos | Margie's</title>
<link rel="canonical" href="https://www.margies.com.ng/rooms/room-onyx" />
<meta property="og:image" content="https://www.margies.com.ng/gallery/Aronyx3.jpg" />
+ HotelRoom, LodgingBusiness and BreadcrumbList JSON-LD
```

Supporting fixes:

- **`vercel.json`** — the old catch-all rewrite sent *everything* to
  `/index.html`, which would have thrown away the prerendered files. The rewrite
  now excludes real files, so `/rooms/room-onyx` serves its own HTML and any
  unknown route still falls back to the SPA.
- **`src/seo/Seo.jsx`** — `og:image` was being set to a relative Vite asset path
  (`/assets/x-abc123.jpg`), which social crawlers reject. All image URLs are now
  absolute. Added `og:site_name`, `og:locale`, `max-image-preview:large`, and a
  `noindex` prop.
- **`noindex`** is now set on `/login`, `/signup`, `/reset-password` and
  `/my-bookings` — thin, private pages that dilute a small site's crawl budget.
- **`src/RoomPage.jsx`** — one `<h1>` with the room name plus location, real
  `<h2>` sections, descriptive `alt` text on every image (`Room Onyx at Margie's
  Gbagada - photo 2` rather than `Room Onyx 2`), `loading="lazy"`, explicit
  width/height to stop layout shift, and a breadcrumb trail.
- **`src/data/rooms.js`** — each room gained `ogImage` (a stable `/gallery/…`
  path that doesn't change hash on every build), `maxGuests`, and `seoTagline`.
- **`scripts/generate-sitemap.cjs`** — adds `lastmod`, `changefreq` and
  `priority`; room pages get priority 0.9.
- **`index.html`** — the default title is now descriptive instead of "Margies".

### After you deploy
1. Submit `https://www.margies.com.ng/sitemap.xml` in Google Search Console.
2. Run a room URL through the Rich Results Test — you should see HotelRoom and
   BreadcrumbList.
3. Paste a room URL into WhatsApp — the preview should show that room's photo
   and text, not the generic logo.
4. If you add a room, re-run `npm run build`; the prerender picks it up from
   `src/data/rooms.js` automatically.

## 5. "Forgot password?" colours
`src/Auth.css`

The cause: `CheckAvailability.css` had a bare `button { background: blue; color:
white; box-shadow: … }` rule. CSS in Vite is global, so that rule applied to
*every* button in the app, including the Forgot-password text link. The old
Auth.css only overrode `background`, so the blue glow and odd hover colour were
still leaking through.

Two fixes: those rules are now scoped to `.availability button` so they can't
escape, and `.forgot-btn` defines every state explicitly — rest, hover,
focus-visible, active and text selection — so nothing can leak into it again.
It now behaves like a normal text link with a soft blue tint on hover.

## 6. Buy the owner a coffee — ₦500
New: `src/Support.jsx`, `src/Support.css`, route `/support`, footer link,
`recordSupportPayment` in `functions/index.js`, rules for `support_payments`.

A ₦500 Paystack tip, no login required. Same trust model as the booking flow:
the browser only sends the payment reference, and the Cloud Function verifies it
with Paystack server-to-server before recording anything, so the amount can't be
forged from devtools. Tips land in a `support_payments` collection that only the
admin can read. Change the amount with `VITE_SUPPORT_AMOUNT_NGN` (and the
matching `SUPPORT_AMOUNT_NGN` constant in `functions/index.js`).

Deploy the new function with:

```bash
cd functions && npm install && cd ..
firebase deploy --only functions:recordSupportPayment,firestore:rules
```

## 7. Testing with a ₦500 room

**Important:** editing `price` in `src/data/rooms.js` will *not* work for
testing. That file is display-only — `functions/index.js` recomputes the real
amount from the Firestore `rooms` document and rejects any payment that doesn't
match. You'd charge ₦500 and then get "Amount paid does not match".

So the price has to change in Firestore. `scripts/set-room-price.cjs` (new) does
it safely:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json

node scripts/set-room-price.cjs list            # see room IDs and prices
node scripts/set-room-price.cjs set onyx 500    # ₦500 for testing
node scripts/set-room-price.cjs restore onyx    # put the real price back
```

`set` stashes the real price in `priceBeforeTest` first, so `restore` always
puts back the correct amount. **Restore it when you're done** — a live ₦500 room
is a real room a real guest can book.

### The safer option
Use Paystack **test mode** instead and pay nothing at all. `src/config.js` now
reads the public key from an environment variable:

```
# .env.local  (do not commit)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
```

Then set the matching test secret key on the backend:

```bash
firebase functions:config:set paystack.secret_key="sk_test_xxxxxxxx"
```

With both in test mode you can run the full flow — real prices, Paystack test
cards, booking written, receipt shown — and no money moves. The coffee page
shows a "Test mode is on" banner so you always know which mode you're in. Just
remember the test *secret* key has to be set on Firebase too, or verification
will fail against live Paystack.

---

# Follow-up fixes (the "internal" error)

## Why the red box said `internal`

Two bugs stacked on top of each other.

**1. My error mapper had a precedence bug.** The Cloud Function threw with code
`functions/internal` and message `"internal"`. The mapper checked
"is the message readable?" *before* "is this a known status code?", and the
string `"internal"` didn't match its noise patterns (they were case-sensitive
and looked for `INTERNAL`), so it passed the raw code straight through to the
screen. Fixed: known status codes now always win over the raw message, the noise
check is case-insensitive, and any message that is a single lowercase word or
hyphenated code (`internal`, `not-found`, `unavailable`) is rejected on sight.
Verified: `functions/internal` → "Something went wrong on our side. Please try
again, or contact us if it continues."

**2. The function genuinely failed.** `internal` means it threw an uncaught
exception. The most likely cause is `functions.config()`, which is deprecated in
firebase-functions v6 (your `functions/package.json` uses `^6.0.1`) and throws in
newer runtimes. It was called at module load, so it took down every callable in
the file before any of my error handling could run.

Fixed three ways:
- `functions.config()` is now wrapped in try/catch and is only a fallback.
- The secret key is read from `process.env.PAYSTACK_SECRET_KEY` first. Copy
  `functions/.env.example` → `functions/.env` and put the key there. This is the
  supported, future-proof way.
- `recordSupportPayment` is wrapped end to end. Anything unexpected is logged
  with its real stack trace and returned to the browser as a readable sentence.

### To confirm the actual cause on your side
```bash
firebase functions:log --only recordSupportPayment
```
The real stack trace is there. If it says the function doesn't exist, it was
never deployed:
```bash
cd functions && npm install && cd ..
firebase deploy --only functions:recordSupportPayment,firestore:rules
```

## Payment success is no longer tied to our backend

The deeper design problem: your money arrived, Paystack confirmed it, and the
page still showed a red error because *our* bookkeeping step failed. That's
backwards.

The thank-you screen now appears the moment Paystack's callback fires. Recording
it in Firestore and sending the email happen afterwards and cannot turn a
successful payment into an error. If recording fails, the guest sees a calm
"keep your reference handy" line and the real error goes to the console and the
function logs, where it belongs.

## The thank-you screen

Replaces the small green message with a proper confirmation: "Thank you - we
appreciate you!", the amount, the payment reference, the note they left, and a
link back to the site.

## Email from Margie's

You were right - nothing was being sent from Margie's, only Paystack's own
receipt. The support page now sends a thank-you through EmailJS (the same
account the signup flow already uses).

**One step needed from you:** create a template in the EmailJS dashboard for
this and set `VITE_EMAILJS_SUPPORT_TEMPLATE_ID`. Right now it falls back to
`template_gtcxcv7`, which is your *signup* template — it will send, but with
signup wording.

In the EmailJS template, set the **To email** field to `{{to_email}}`. If you
leave it as a fixed address, every thank-you goes to that one inbox instead of
the guest. Variables available: `{{name}}`, `{{email}}`, `{{to_email}}`,
`{{amount}}`, `{{note}}`, `{{reference}}`, `{{message}}`, `{{subject}}`.

```
# .env.local
VITE_EMAILJS_SUPPORT_TEMPLATE_ID=template_xxxxxxx
VITE_OWNER_EMAIL=your@email.com
```

If the email fails, the thank-you screen quietly falls back to mentioning the
Paystack receipt instead. The guest never sees an email error.

### Worth knowing
EmailJS sends from the browser, so the template ID and public key are visible in
your JS bundle and anyone can trigger sends against your quota. Fine for low
volume. If it becomes a problem, move sending into the Cloud Function (where the
`notifyOnNewBooking` trigger is already stubbed) using Resend, SendGrid or
Mailgun — then the credentials stay server-side and emails send even if the
guest closes the tab.

---

# Third pass — confirmation screens, countdowns, contrast

## Root cause behind all three visual bugs

`src/App.css` contains **two competing stylesheets**: a light theme at the top,
and a full copy of the dark landing-page theme pasted in below it. The second
copy wins, which is why the site renders dark while the first half of the file
still describes a white header.

On top of that, four stylesheets each declared their own `:root` variables —
`--bg`, `--card`, `--muted`, `--accent`. CSS variables on `:root` are global, so
whichever file Vite happened to bundle last set the values for all of them.
`CheckAvailability.css` said `--bg: #f6f7fb` (near-white) and `App.css` later
overrode it with `#0e0f12` (near-black), while the text colours stayed dark. The
labels weren't missing — they were dark grey on a dark card.

Fixed by scoping variables to their own components (`.availability`,
`.my-bookings`) so they can't leak, and by putting the header corrections at the
very end of `App.css` where nothing can override them.

**Worth doing properly at some point:** delete the duplicated block in
`App.css`. I left it alone because removing it would let the stale light-theme
rules above it take over and flip the whole site white. That's a bigger cleanup
than tonight's fixes warranted.

## 1. Booking confirmation screen

Booking now ends on the same kind of screen as the coffee page — "Thank you,
your booking is confirmed!" with room, check-in and check-out dates (including
the 2:00 PM / 12:00 noon house times), nights, guests, total paid, and the
payment reference, then buttons to **View my bookings** or return home.

Same principle as the coffee fix: the screen appears the moment Paystack
confirms. If the verification call fails afterwards, the guest still sees their
confirmation and reference, with a calm amber note — not a red error over a
successful payment.

**A booking confirmation email now sends from Margie's too**, with the full stay
details. Paystack's receipt only covers the money.

## 2. My Bookings page

Rebuilt from the bare list into detail cards:

- **Live countdowns, ticking every second.** Upcoming bookings show *"Your stay
  begins in"* with days/hours/mins/secs. Bookings in progress show *"Time left
  before check-out"*. Both stop on their own when the moment arrives.
- **Status badges** — Staying now / Upcoming / Completed / Cancelled, sorted so
  current and upcoming stays come first.
- **Full details** — dates with the house check-in and check-out times, nights,
  guest count, name, total paid, payment reference.
- Cancel now asks for confirmation first, and only appears on bookings that can
  still be cancelled.
- A real empty state instead of the bare "No bookings yet."

Countdowns are computed in `src/utils/bookingTime.js`, using 2:00 PM check-in
and 12:00 noon check-out. Those constants live in one place and must stay in
sync with the `checkinTime` / `checkoutTime` in your schema.org data.

## 3. "Margie's" and "About" touching

`.nav__inner` uses `justify-content: space-between` with no `gap`, so the brand
butted straight into the first link. Added a 2rem gap and a nowrap brand title.

## 4. Logout button invisible

`<button>` elements don't inherit `color` — they fall back to the browser
default, which is near-black. On a near-black header that made "Logout"
invisible. `.admin-button-link` now sets its colour, border and font explicitly.

While there: your email was stretching the bar wider than the window, so it's
truncated to 150px with the full address in the tooltip. The nav also collapses
to the hamburger at 1100px instead of 700px — nine items were colliding long
before the old breakpoint.

## 5. Check-availability labels invisible

Same `:root` collision described above. The whole panel is now dark-themed to
match the site: light labels, dark card, white inputs with dark text.

## 6. Admin login — there are no default credentials

Nothing is hardcoded, and this is deliberate. Admin is a **Firebase Auth account
with a custom claim**, and `ProtectedAdminRoute` checks the claim on the token,
so it can't be faked from the browser.

To make yourself admin:

1. Sign up normally at `/signup` with the email you want to use as admin.
2. Firebase Console → Authentication → Users → copy that account's **UID**.
3. Project Settings → Service Accounts → Generate new private key (save it
   outside the repo).
4. Run:
   ```bash
   node scripts/setAdminClaim.cjs /path/to/serviceAccountKey.json <the-uid>
   ```
5. Log out and back in — the claim only lands on a freshly issued token.
6. Go to `/admin-login`, sign in with that email and password, and you'll be let
   through to `/admin`.

If `/admin-login` says the account has no admin access, step 5 is almost always
the reason.

Two things to know. There's no link to `/admin-login` anywhere in the UI — you
navigate to it directly, and it's excluded in `robots.txt`. And the claim is
per-account: if you grant it to several people, every one of them can read all
bookings, contact messages and tips, so grant it sparingly.
