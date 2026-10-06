# Research: what clinics in Vadodara run today, and what to build instead

Gathered 2026-10-06. Sources: the LeadHunter database (62 clinic leads scraped from Google Maps in Alkapuri, Gotri and Karelibaug), three of those clinics' sites opened in a browser, the current Serenity demo, and published write-ups on clinic website and software patterns.

Not seen first-hand: Dribbble (human-verification wall) and hellotend.com (Cloudflare block). Dribbble links are at the bottom for you to browse yourself.

## 1. The current demo (serenity.soulplexstudios.tech)

Source is this repository (static HTML, seven files).

What makes it weak as a sales tool:

- **It is a brochure, not a product.** The pitch is "appointments and patient management", and the site shows neither. `booking.html` is a request form; nothing shows slots, confirmations, a calendar or a patient list.
- **The booking form has 11 fields**, including date of birth and "preferred dentist", before the patient gets anything back. It ends with "we'll confirm within 24 hours".
- **It is American.** Dr. Alexandra Chen, phone (310) 555-8273, "insurance friendly", `serenitydental.com`. A dentist in Vadodara does not see their own clinic in it.
- **It looks like every AI-made clinic template.** Sage green, Cormorant Garamond with one italic accent word ("Where Your *Smile* Meets Exceptional Care"), pill buttons, a "15+ Years Experience" chip. The hero photo is a man with a stethoscope on a dental site.
- **Pages of filler** (gallery, testimonials, about) that a prospect will not read in a pitch.

## 2. What the 62 clinic leads actually have

| | Count |
|---|---|
| No website at all | 34 |
| A page on someone else's platform | 12 |
| Their own website | 16 (2 of them broken) |

The 12 platform pages: 7 on apnabusinesscard.com (digital visiting cards), and one each on getmy.clinic, eka.care, brands.live, panoee.net (a 360° tour) and vadodarahelpline.com.

So **46 of 62 clinics (74%) have no website of their own.** Review counts show these are busy practices: several have 250 to 550 Google reviews.

Three sites opened and checked:

- **The Tooth Clinic Baroda** (4.9, 567 reviews, the most-reviewed clinic in the set). WordPress. Headline is keyword-stuffed for search ("Expert Dentists in Vadodara – Painless & Affordable Dental Care"). The buttons say "Get Started" and "Contact us". No booking button, no form, no WhatsApp link on the homepage.
- **Aum Physiotherapy** on apnabusinesscard.com (5.0, 147 reviews). A phone-shaped visiting card on a black patterned background: Call, WhatsApp, Mail, a QR code. No services, no timings, no booking. Seven physio clinics in the set use this same card.
- **Dr. Khushboo Patel** on getmy.clinic. The only one with real booking: the first screen says "Next available at 9:30 AM, Tomorrow" with a Book button. That is the right idea. The execution is a clip-art avatar, a generic blue template, and the platform's subdomain instead of the doctor's own.

Clinic websites with a health check on record (the full list, sorted by reviews):

| Clinic | Rating (reviews) | Site | Status |
|---|---|---|---|
| The Tooth Clinic Baroda | 4.9 (567) | thetoothclinicbaroda.com | working |
| Dr Amish Mehta's Chandan Dental | 4.7 (374) | chandanorthodontics.com | working |
| Aalayam Rehab Care | 4.9 (340) | aalayam.care | broken, SSL error |
| ReLiva Physiotherapy & Rehab | 5.0 (266) | reliva.in | working (national chain) |
| Dental Spa | 4.9 (256) | drpreays.com | working |
| Dev Physiotherapy & Healthcare Center | 4.9 (251) | devphysiotherapy.com | working |
| Shree Hari Dental Care | 4.9 (173) | shreeharidentalcare.co.in | slow (5s), no HTTPS |
| The Physio Factor | 4.9 (149) | thephysiofactor.com | slow (10s), no HTTPS |
| Dental Clinic & Implant Center | 4.9 (126) | smilecreation.in | no HTTPS |
| Grow Physio | 5.0 (107) | growphysio.in | working, no HTTPS |
| Rehabs | 4.0 (57) | bionicrehabs.com | no HTTPS |
| Dishir | 4.4 (33) | dishir.in | no HTTPS |
| Physiobia | 5.0 (26) | physiobia.in | working |
| Care 32 | 5.0 (18) | care32dentalclinics.com | working |
| Core & Cure Physiotherapy | 5.0 (15) | coreandcure.com | working |
| Nisha Dental Clinic | 4.3 (13) | nishadentalinic.com | broken, not loading |

Best first calls from this list: Aalayam Rehab Care (340 reviews, site is down), Shree Hari Dental and The Physio Factor (busy, slow, no HTTPS), and the seven physio clinics on visiting-card pages.

## 3. What the competition charges

From 2026 comparison articles (vendor blogs, so treat the numbers as rough):

- Small clinics in India typically spend ₹2,000 to ₹8,000 a month on clinic software.
- **Practo Ray:** about ₹2,000 a month and up, plus per-appointment fees, so cost rises as the clinic gets busier. Its draw is the Practo patient marketplace.
- **HealthPlix:** EMR-first, built around fast prescriptions for the doctor.
- **Eka Care:** free tier, ABHA integration, WhatsApp connectivity.

None of them give the clinic its own website on its own domain. That is the gap: the clinic's own site, with booking and a simple front-desk view, at a flat price.

## 4. Patterns worth copying

From the pattern write-ups and from getmy.clinic:

1. **Show the next free slot on the first screen.** "Next available: today 5:30 PM" beats any headline.
2. **One primary button, no carousel.** The headline names the specialty and the area.
3. **Booking in under 90 seconds on a phone, three taps from home to confirmed.** Ask name and reason first; everything else later or never.
4. **More than one way in:** tap to call and WhatsApp beside online booking. Plenty of patients will still call.
5. **The doctor is a named person:** degree, registration, years in practice, a line in their own words, a real photo.
6. **FAQs sit where the decision is made** (fees, timings, parking, what to bring), not on a page of their own.
7. **Reminders are the feature clinics pay for.** WhatsApp and SMS reminders cut no-shows; every competitor leads with them.

## 5. Dribbble and other places to look (browse these yourself)

- https://dribbble.com/tags/clinic-management
- https://dribbble.com/tags/clinic-dashboard
- https://dribbble.com/tags/doctor-appointment-dashboard
- https://dribbble.com/search/patient-scheduling
- https://dribbble.com/shots/24899734-Medical-Dashboard-for-Effective-Patient-Management-ProvoHeal

Shot names that came up in search results: Doc.track (patient and appointment management), Tabiib (appointments as a kanban board), WellNest (hospital dashboard widgets), Doctris (booking plus admin).

A caution when borrowing from Dribbble: most clinic dashboards there are built to look impressive, with eight stat cards and three charts. A receptionist needs today's list and a big "mark arrived" button. Borrow the calendar and patient-row treatments; skip the chart walls.

## Sources

- [7 Healthcare Website Design Patterns for Clinics to Cut Booking to 3 Clicks](https://uxui.ee/blog/healthcare-website-design)
- [Top 10 Healthcare Website Design Examples For 2026](https://www.digitalsilk.com/digital-trends/best-healthcare-website-design-examples/)
- [15 Best Medical Website Designs to Take Inspiration From (2026)](https://www.magier.com/blog/best-medical-website-designs)
- [6 Best Medical Website Designs: Ideas For Your Clinic](https://healthus.ai/medical-website-designs-ideas-for-clinics/)
- [Best Clinic Management Software in India (2026), 10 Compared](https://ichelonconsulting.com/best-clinic-management-system-india)
- [Clinic Management System Cost in India 2026](https://ichelonconsulting.com/clinic-management-system-cost-india-2026)
- [5 Best Clinic Management Software for Small Clinics in India (2026)](https://www.cufront.com/blog/best-clinic-management-software-small-clinics-india)
- [Healthplix vs Practo vs Eka Care vs Cufront (2026)](https://www.cufront.com/blog/healthplix-vs-practo-vs-eka-care-vs-cufront)
- [Dribbble: Clinic Management](https://dribbble.com/tags/clinic-management), [Clinic Dashboard](https://dribbble.com/tags/clinic-dashboard), [Doctor Appointment Dashboard](https://dribbble.com/tags/doctor-appointment-dashboard)
