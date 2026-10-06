# Serenity clinic demo

Live at serenity.soulplexstudios.tech (Netlify, built from `main`). The preset clinics are all named Serenity to match; a pitch URL still overrides the name.

A sales demo for Soulplex Studios. It shows a clinic owner two things working together under their own clinic's name: a complete clinic website where a patient books a visit directly, and a front-desk screen where that booking appears a moment later.

It replaces the old Serenity brochure site that lived in this repository (still in git history before the `clinicdesk-rebuild` branch).

| Route | What it is |
|---|---|
| `/` | Home, sixteen sections: slideshow hero with booking bar, figures, live week of free times, all services, conditions treated, about, a film panel, booked versus walk-in, how booking works, WhatsApp message preview, the doctor, photo strip, reviews, languages, timings and FAQs, map. |
| `/about` | The clinic's story, figures, why patients come, facilities. |
| `/services` | Every service as a photo card with its fee. |
| `/services/<id>` | One service: what to expect, what to bring, the fee, the next free times, "Book this". |
| `/doctor` | The doctor's profile, qualifications, registration number, and the services they offer. |
| `/gallery` | Photos of the clinic and the care, with a full-screen viewer. |
| `/reviews` | Patient reviews (sample text in the demo). |
| `/faq` | Questions answered, with call and WhatsApp beside them. |
| `/contact` | Address, call and WhatsApp, map link, weekly timings, emergency notice. |
| `/book` | The three-step booking flow and the confirmation. Reachable from every page. |
| `/desk` | The front desk: Today, Calendar, Patients, Reminders. |
| `/pitch` | Presenter view: the public site in a phone frame beside the desk. |

The public pages are in English, Hindi and Gujarati, switchable from the header and remembered on the device.

## Run it

Needs Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production build
```

There is no database and no environment file. Everything runs in the browser.

## Pitch with it

Open `/pitch` with the prospect's details in the URL:

```
/pitch?clinic=Aalayam+Rehab+Care&doctor=Dr.+Mehta&specialty=physio&area=Alkapuri&phone=9876543210
```

| Parameter | Effect | Default |
|---|---|---|
| `clinic` | Clinic name everywhere, including the WhatsApp messages | the preset's fictional clinic |
| `doctor` | Doctor's name | the preset's fictional doctor |
| `specialty` | `dental`, `physio`, `skin`, `child` or `general`. Sets services, fees, qualifications and sample visit notes | `dental` |
| `area` | Locality shown in the headline and address | Alkapuri |
| `phone` | Ten-digit mobile for the Call and WhatsApp buttons | none |

The same parameters work on `/`, `/book` and `/desk`. The last set used is remembered on the device, so a bare `/desk` opened afterwards still shows that clinic.

On the pitch screen:

- **Change clinic** fills in the parameters with a form, if you would rather not edit the URL.
- **Copy the patient link** copies the public page's address to send to the doctor's own phone.
- **Reset the day** restores the seeded day and returns both screens to their start.

What to show, in order: book a visit on the phone frame and let the doctor watch it land on the desk; mark that patient arrived on the desk and point at the phone, where the confirmation now says the clinic has checked them in; open Reminders and press **Open in WhatsApp**.

Two things to know before a live pitch:

- Without `phone`, the Call button opens an empty dialler and WhatsApp asks which contact to message. Pass the prospect's number to make both buttons real.
- A booking made on a *different device* (the doctor's own phone) will not appear on your laptop's desk. The two screens share data only within one browser. Use the phone frame in `/pitch` for the live moment. See "What is simulated" below.

## Deploy

The live site is on Netlify and builds from the `main` branch using `netlify.toml` (`npm run build`, Node 22, Netlify's Next.js runtime). Pushing to `main` deploys. A pull request gets its own preview address from Netlify before it is merged.

## How it is built

- Next.js 16 (App Router), TypeScript, Tailwind 4. Design tokens are in `app/globals.css`, with the reasoning for the palette at the top of the file: clinical blue on white, teal for "open" and "available", Plus Jakarta Sans for headings and Noto Sans for text (Hindi and Gujarati headings use Noto). This departs from `BUILD_PROMPT.md`, which asked for a non-medical palette and a single public page; the studio asked for a conventional medical look and a complete site instead.
- Motion: the home hero is a full-bleed slideshow of the specialty's photos that drift and dissolve into one another, with the headline rising in word by word and a booking bar docked across its lower edge (`components/public/Hero.tsx`). `components/public/Motion.tsx` runs the rest: sections rise in with a stagger as they scroll into view, photos drift against the scroll, the header gains a shadow. Also a moving strip of services, hover zooms, a light sweep on the main buttons and a count-up on the figures. Visitors who ask for reduced motion get fades only.
- Photos and the film loop are in `public/media/`: four photos per specialty (`dental-1.jpg` and so on), four of clinic interiors (`space-*.jpg`), and `clinic-loop.mp4`. Photos are from Unsplash and the film from Mixkit, both under licences that allow commercial use without credit. Replace them with the clinic's own by keeping the same file names.
- `components/public/` holds the website (`SiteShell` is the shared header, navigation and footer); `components/desk/` the front desk; `components/pitch/` the presenter view.
- `lib/clinic.ts` holds the five specialty presets and reads the URL parameters.
- `lib/i18n.ts` holds the interface text in three languages. The front desk is English only.
- `lib/data/types.ts` defines `ClinicData`, the one interface every screen uses for data. `lib/data/local.ts` implements it on `localStorage`; `lib/data/core.ts` holds the seed and the pure read logic. To move to a real backend, write a second implementation of `ClinicData` and swap it in `components/ClinicProvider.tsx`. No screen needs to change.
- All dates and times are India Standard Time regardless of the device.

The seeded day is generated from the current date and time: earlier patients are done, one is with the doctor, one is waiting, the rest of today and the coming week are partly booked. It regenerates each new day.

## What was checked

Opened in Chrome at 360px, 1024px and 1280px and clicked through:

- All nine public pages in English, Hindi and Gujarati at 360px: no sideways scrolling, every link and button at least 44px tall.
- Home to confirmed booking. From the booking bar under the hero, the service and the next free time are already chosen, so it is two taps: "Book a visit", then confirm. "Book this" on a service page is also three. From the header or the bar at the bottom of a phone it is four.
- `/pitch`: a booking on the phone appeared on the desk in about 60 ms without a reload; marking it arrived on the desk updated the phone's confirmation.
- Booking a taken slot a second time is refused with a message, and the slot is no longer offered.
- `?specialty=physio` gives physiotherapy services, fees, 30-minute slots and notes.
- Reset restores the seeded day.
- Desk: move, cancel, block and unblock on the calendar; add a walk-in; status changes; paid and not paid; patient search by name and number; adding a note; reminders opening `wa.me` links.
- Lighthouse, mobile, production build on localhost, default settings: performance 91, accessibility 100, best practices 100. With network and CPU throttling actually applied the performance score was 74 to 87 across runs, and the largest paint (the hero photo) took 2.4 to 3.2 s. That is over the 2.5 s target in `BUILD_PROMPT.md`; it is the cost of the photography.

Not verified:

- A real Android phone. Everything was tested in desktop Chrome's phone emulation.
- Two separate browser tabs racing for the same slot at the same instant. Writes are serialised with the Web Locks API and the second booking is refused in sequence, but a true simultaneous race was not staged.
- The calendar file ("Add to calendar") opening in a phone's calendar app.
- Hindi and Gujarati text was written by hand, not machine-transliterated, but has not been read by a native speaker. Have one read it before a pitch.
- Lighthouse against a deployed Vercel URL.

## What is simulated, and what a paying clinic needs

| In the demo | For a real clinic |
|---|---|
| Data lives in one browser's `localStorage`. The phone and the desk sync only when both are open in the same browser. | A database (Supabase is the planned choice) behind the `ClinicData` interface, with realtime updates so any phone reaches any desk. |
| `/desk` opens for anyone. | Staff logins, with separate roles for the receptionist and the doctor. |
| Reminders are a list; "Open in WhatsApp" opens the device's WhatsApp with the text filled in and a person presses send. Nothing is sent automatically, and "Opened" is not a delivery receipt. | The WhatsApp Business API (through a provider) with approved message templates, scheduled sending the evening before and two hours before, and real delivery status. |
| The confirmation shows a preview of the WhatsApp message. No message is sent to the patient. | The same message sent automatically on booking. |
| "Paid" is a tick the receptionist toggles. Collections are a sum of those ticks. | Payment collection (UPI or a gateway such as Razorpay), receipts, and a proper ledger for part payments. |
| Patients, the preset clinics and doctors, phone numbers, registration numbers and visit notes are all fictional. | Consent capture, a privacy notice, access controls, data retention and deletion handling under India's Digital Personal Data Protection Act. Visit notes are health data and need particular care. |
| Clinic hours, slot length and fees are fixed per specialty preset. | A settings screen for hours, holidays, slot length, services and fees. |
| The map link searches Google Maps for the clinic name and area. | The clinic's actual Maps listing, and its real address. |
| Photos and the film are stock. The people in them are not the clinic's staff, and the doctor is shown as initials for that reason. | The clinic's own photographs and video. |
| Reviews, the "patients treated" figure and the Google rating are sample content. Facilities and parking are generic text. | The clinic's real reviews, figures, facilities and wording. Invented reviews must not go on a live clinic site. |
| One doctor per clinic. | Several doctors or chairs, each with their own calendar. |

The brief and the evidence behind it are in `BUILD_PROMPT.md`, `PRODUCT.md` and `RESEARCH.md`.
