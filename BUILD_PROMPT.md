# Build prompt: ClinicDesk demo

Paste everything below the line into your coding agent, with this folder open. `PRODUCT.md` and `RESEARCH.md` sit beside this file; read both first.

---

Build a working demo that a web studio (Soulplex Studios, Vadodara) will open in front of clinic owners to sell them a website with online booking and a front-desk system. Working name: ClinicDesk. Read `PRODUCT.md` for who it is for and `RESEARCH.md` for the evidence behind these decisions before you write any code.

## Why this exists

The studio's current demo is a seven-page brochure site for a fictional American dentist. It claims to help with appointments and patient management and shows neither. Meanwhile 46 of the 62 clinics the studio has scraped in Vadodara have no website of their own, and the busiest one that does has no booking button on its homepage. A demo that lets a doctor watch a booking travel from a patient's phone to the reception desk will sell where a brochure does not.

The demo has to survive a live pitch on hotel wifi, on the doctor's own phone, with no setup. That shapes several decisions below.

## What is already in this folder

This repository is that current demo: seven static pages (`index.html`, `about.html`, `services.html`, `booking.html`, `testimonials.html`, `gallery.html`, `contact.html`), live at serenity.soulplexstudios.tech and pushed to `github.com/Abhijit1018/Docapp`. You are replacing it in place, not adding to it.

- Work on a new branch. The old pages stay recoverable through git history, so delete them once the new app renders; do not keep them alongside or port their markup.
- Nothing in them is worth carrying over: the copy is for an American dentist, the palette and type are the look to avoid, and the booking form is the 11-field request form this build exists to replace.
- Leave the tool folders alone (`.agent`, `.agents`, `.continue`, `.kiro`, `.qoder`, `.trae`, `skills`, `skills-lock.json`).
- Do not deploy over the live site or push to `main` without being asked. Deploy to a preview first.

## What to build

Two surfaces sharing one set of data.

### 1. The clinic's public site (patients)

A single page plus the booking flow. Phone first: design at 360px wide, then scale up.

- **First screen:** clinic name, the doctor's name and qualification, the area, and a live line such as "Next available: today, 5:30 PM". One primary button, "Book a visit". Beside it, tap-to-call and WhatsApp. No carousel, no stat counters.
- **Below:** the doctor as a real person (degree, registration number, years in practice, two sentences in their own voice), services with fees in rupees, clinic timings for the week with today highlighted, location with a map link, and four or five questions answered in place (fees, what to bring, parking, how to reschedule).
- **Booking flow, three steps:** pick a service, pick a day and a time from real open slots, then give a name and a mobile number. Nothing else is required. Booking for someone else is one optional field. The confirmation screen shows the appointment, an "Add to calendar" action, and a preview of the WhatsApp message the patient would receive.
- A taken slot must disappear for the next visitor. Double booking the same slot must be impossible.
- **Languages:** English, Hindi and Gujarati, switchable from the header, remembered on the device. Translate the interface text properly; do not machine-transliterate.

### 2. The front desk (receptionist and doctor)

Reached at `/desk`. Works on a laptop and on a tablet held sideways.

- **Today, the default view:** the day's appointments in time order, each with a status the receptionist changes in one tap: booked, arrived, in consultation, done, no-show. A clear "next patient" marker. A button to add a walk-in or a phone booking in under ten seconds.
- **Calendar:** a week view of slots, to move or cancel an appointment and to block time (lunch, leave, an emergency).
- **Patients:** a searchable list by name or mobile number. A patient's page shows visits, notes from each visit, the next appointment and what they owe. Adding a note is one text box.
- **Reminders:** a list of WhatsApp messages due to go out (the evening before, and two hours before), each showing the exact text. In the demo, "send" opens WhatsApp with the message filled in via a `wa.me` link. Do not fake a delivered tick.
- **A small numbers strip, not a dashboard:** patients today, no-shows this week, and collections today in rupees. No charts on the default view.

### 3. Pitch mode

This is what makes it a sales tool.

- The demo is re-skinned from the URL: `?clinic=Aalayam+Rehab+Care&doctor=Dr.+Mehta&specialty=physio&area=Alkapuri`. The clinic name, doctor, services, fees and sample patients change to suit the specialty. Ship presets for dental, physiotherapy, skin, child care and general practice.
- A "Present" layout at `/pitch` shows a phone frame with the public site on the left and the front desk on the right. A booking made in the phone frame appears on the desk within a second. This is the moment the doctor buys; make it obvious and satisfying, without confetti.
- A reset control restores the seeded day.
- A small, permanent "Demo data, patients are fictional" label on the desk.

## Technical decisions

- **Stack:** Next.js (App Router) with TypeScript, deployed on Vercel. Tailwind is acceptable if you define the design tokens first; do not ship default Tailwind colours.
- **Data for version one:** no backend. Seed data generated at load, state held in the browser (and synced between the two halves of pitch mode with a `BroadcastChannel` or shared store). This is deliberate: the demo must work offline-ish and never fail in a pitch because a database slept.
- **Put all data access behind one interface** (`listSlots`, `bookSlot`, `listAppointments`, `setStatus`, `getPatient`, `addNote`, and so on), so that a Supabase implementation can replace the in-browser one later without touching the screens.
- Seed a believable day relative to the current date and time: some patients done, one in consultation, several upcoming, one no-show. Use Indian names, +91 numbers and realistic fees (a dental consultation around ₹300 to ₹500, a physio session ₹500 to ₹800).
- Performance budget: the public page's largest element paints in under 2.5 seconds on a throttled 4G phone. No hero video, no heavy animation library.
- Accessibility: tap targets at least 44px, visible keyboard focus, WCAG AA contrast, works with reduced motion, form fields with real labels.

## Design direction

Decide the look from the scene, not from the category. Two scenes: a patient outdoors in afternoon sun on a ₹12,000 Android phone, and a receptionist at a bright front desk with a phone ringing. Both call for a light theme, strong contrast, large type and big tap targets.

The category reflex is teal or sage on white with a serif accent, and the current demo is exactly that. Avoid it. Commit to a palette a clinic owner would not have seen on ten other sites: for instance warm paper neutrals with deep ink and one confident accent used only for actions and the current state. Pick the accent yourself and justify it in a comment at the top of the tokens file. Status colours on the desk (arrived, in consultation, done, no-show) must be distinguishable without relying on colour alone.

One type family is enough. It must render Devanagari and Gujarati well; check that before choosing (Noto Sans, Mukta, Hind and Anek cover all three scripts).

Use real-looking photography only if you have a real photo. Otherwise use initials, clean illustration or nothing. No stock model with a stethoscope.

The front desk should feel like a tool people trust on sight (think Linear or Stripe in restraint, not in colour): dense where the receptionist needs density, quiet everywhere else. No card grids of identical tiles, no gradient text, no glass effects, no coloured stripe down the side of cards.

## Constraints

- All patients, doctors and clinics in the seed data are fictional. Do not copy names, photos or text from real clinics, including the ones listed in `RESEARCH.md`.
- Do not send real messages or make real calls from the demo. WhatsApp and call actions open the device's own app.
- No sign-up wall anywhere in the demo. `/desk` opens directly.
- Do not add pages the pitch does not need (blog, gallery, testimonials, careers).

## Done means

- On a phone: home to confirmed booking in three taps and under 90 seconds, in each of the three languages.
- In `/pitch`: a booking made on the left shows up on the right without a reload; changing its status on the right updates the slot on the left.
- The same slot cannot be booked twice, including from two tabs.
- `?clinic=...&specialty=physio` produces a physiotherapy clinic with matching services, fees and patients.
- Reset restores the seeded day.
- Lighthouse on the public page: performance, accessibility and best practices at 90 or above on mobile.
- You have opened it in a browser at 360px and 1280px, clicked through every flow above, and fixed what you found. Report anything you could not verify.

## What to hand back

The running project, a short `README.md` (how to run, how to deploy, how to use pitch mode with a URL), and a note listing what is simulated in the demo and what a paying clinic would need built for real: a database, logins for staff, the WhatsApp Business API for automatic reminders, payment collection, and consent handling for patient data under India's DPDP Act.
