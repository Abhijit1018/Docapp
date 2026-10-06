// Pure functions over the demo state: the seeded day and every read the
// screens need. No browser APIs here, so the server can render the first
// "next available" line from the same seed the browser will start with.

import { messageText } from "../messages";
import type { Clinic } from "../clinic";
import { addDays, nowIST, startOfWeek, toEpoch, weekday, type DateStr } from "../time";
import type {
  Appointment, AppointmentView, Patient, PatientDetail, PatientSummary, Reminder, Slot, State, Stats, Status,
} from "./types";

const NAMES = [
  "Kavita Shah", "Imran Pathan", "Bhavna Patel", "Rajesh Parmar", "Nisha Joshi", "Harsh Desai", "Farida Shaikh",
  "Manoj Solanki", "Pooja Trivedi", "Suresh Rathod", "Meena Amin", "Yash Gandhi", "Anjali Nair", "Dinesh Chauhan",
  "Rekha Barot", "Vikram Gohil", "Sneha Kulkarni", "Alpesh Prajapati", "Zainab Vohra", "Kiran Makwana",
  "Jignesh Thakkar", "Lata Iyer", "Rohan Mistry", "Daksha Panchal", "Sunil D'Souza", "Hina Pandya", "Ketan Bhavsar",
  "Shilpa Rao", "Mehul Raval", "Tasneem Kapadia", "Gaurav Sinha", "Urvashi Dave",
];
const PREFIXES = ["98250", "99250", "97240", "90990", "98980", "96010"];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function slotTimes(clinic: Clinic, date: DateStr): number[] {
  const out: number[] = [];
  for (const [open, close] of clinic.hours[weekday(date)])
    for (let t = open; t + clinic.slotMinutes <= close; t += clinic.slotMinutes) out.push(t);
  return out;
}

/**
 * A believable clinic fortnight around the current moment: earlier patients
 * done, one with the doctor, one waiting, the rest of today and the coming
 * days partly booked. Same date and specialty always give the same people.
 */
export function seedState(clinic: Clinic, nowMs: number): State {
  const { date: today, minutes: now } = nowIST(nowMs);
  const r = mulberry(hash(clinic.specialty + today));
  const slot = clinic.slotMinutes;

  const patients: Patient[] = NAMES.map((name, i) => ({
    id: "p" + (i + 1),
    name,
    phone: PREFIXES[i % PREFIXES.length] + String(10000 + Math.floor(r() * 89999)),
    lang: i % 5 === 1 ? "gu" : i % 5 === 3 ? "hi" : "en",
    fictional: true,
    notes: [],
  }));

  const blockDate = addDays(today, 2);
  const blocks = weekday(blockDate) === 0
    ? []
    : [{ id: "b1", date: blockDate, start: 1140, end: 1260, reason: "Doctor at a conference" }];

  const appointments: Appointment[] = [];
  let seq = 1;
  for (let off = -8; off <= 7; off++) {
    const date = addDays(today, off);
    const fill = off < 0 ? 0.66 : off === 0 ? 0.6 : off === 1 ? 0.42 : off === 2 ? 0.28 : 0.14;
    const seen = new Set<number>();
    for (const time of slotTimes(clinic, date)) {
      const current = off === 0 && time <= now && now < time + slot;
      const upNext = off === 0 && time > now && time <= now + slot;
      const roll = r();
      // Later today stays emptier, so a pitch can always book "today".
      const laterToday = off === 0 && time > now + slot;
      if (!(roll < (laterToday ? 0.38 : fill) || current || upNext)) continue;
      if (blocks.some((b) => b.date === date && time >= b.start && time < b.end)) continue;

      let pi = Math.floor(r() * patients.length);
      while (seen.has(pi)) pi = (pi + 1) % patients.length;
      seen.add(pi);

      const pick = r();
      const service = clinic.services[pick < 0.45 ? 0 : pick < 0.72 ? 1 : 2 + Math.floor(r() * (clinic.services.length - 2))];
      const status: Status =
        off < 0 ? (r() < 0.07 ? "no_show" : "done")
        : off > 0 ? "booked"
        : time + slot <= now ? "done"
        : time <= now ? "in_consultation"
        : upNext ? "arrived"
        : "booked";
      const src = r();
      const walkedIn = src > 0.8 && status !== "booked";
      const start = toEpoch(date, time);
      appointments.push({
        id: "a" + seq++,
        date,
        time,
        patientId: patients[pi].id,
        serviceId: service.id,
        status,
        source: walkedIn ? "walkin" : src < 0.45 ? "online" : "phone",
        fee: service.fee,
        paid: status === "done" ? service.fee : 0,
        createdAt: walkedIn ? start : Math.min(start - (1 + Math.floor(r() * 3)) * 86400000, nowMs - 3600000),
      });
    }
  }

  // One no-show and one unpaid visit, so the numbers strip and the dues
  // column have something true to show.
  const doneToday = appointments.filter((a) => a.date === today && a.status === "done");
  if (doneToday.length >= 3) Object.assign(doneToday[1], { status: "no_show", paid: 0 });
  if (doneToday.length >= 5) doneToday[3].paid = 0;
  const earlier = appointments.find((a) => a.date === addDays(today, -3) && a.status === "done");
  if (earlier) earlier.paid = 0;

  let noteSeq = 1;
  for (const a of appointments) {
    if (a.status !== "done" || r() > 0.8) continue;
    const text = clinic.sampleNotes[Math.floor(r() * clinic.sampleNotes.length)];
    patients.find((p) => p.id === a.patientId)!.notes.push({ id: "n" + noteSeq++, date: a.date, text });
  }

  return { v: 2, specialty: clinic.specialty, seedDate: today, seededAt: nowMs, patients, appointments, blocks, opened: {} };
}

// ---- Reads -----------------------------------------------------------------

/** A patient needs a few minutes to get there; slots closer than this are gone. */
const LEAD_MINUTES = 10;

export function isTaken(state: State, date: DateStr, time: number, exceptId?: string): boolean {
  return state.appointments.some((a) => a.date === date && a.time === time && a.status !== "cancelled" && a.id !== exceptId);
}

export function daySlots(state: State, clinic: Clinic, date: DateStr, nowMs: number): Slot[] {
  const now = nowIST(nowMs);
  return slotTimes(clinic, date).map((time) => ({
    date,
    time,
    state:
      date < now.date || (date === now.date && time < now.minutes + LEAD_MINUTES) ? "past"
      : state.blocks.some((b) => b.date === date && time >= b.start && time < b.end) ? "blocked"
      : isTaken(state, date, time) ? "taken"
      : "open",
  }));
}

export function nextOpenSlots(state: State, clinic: Clinic, nowMs: number, limit: number): Slot[] {
  const out: Slot[] = [];
  const today = nowIST(nowMs).date;
  for (let off = 0; off < 8 && out.length < limit; off++)
    for (const s of daySlots(state, clinic, addDays(today, off), nowMs))
      if (s.state === "open" && out.length < limit) out.push(s);
  return out;
}

export function view(state: State, a: Appointment): AppointmentView {
  return { ...a, patient: state.patients.find((p) => p.id === a.patientId)! };
}

export function appointmentsBetween(state: State, from: DateStr, to: DateStr): AppointmentView[] {
  return state.appointments
    .filter((a) => a.date >= from && a.date <= to && a.status !== "cancelled")
    .sort((a, b) => (a.date === b.date ? a.time - b.time : a.date < b.date ? -1 : 1))
    .map((a) => view(state, a));
}

function summarise(state: State, patient: Patient, nowMs: number): PatientDetail {
  const now = nowIST(nowMs);
  const appointments = state.appointments
    .filter((a) => a.patientId === patient.id && a.status !== "cancelled")
    .sort((a, b) => toEpoch(b.date, b.time) - toEpoch(a.date, a.time));
  const done = appointments.filter((a) => a.status === "done");
  const upcoming = appointments
    .filter((a) => (a.status === "booked" || a.status === "arrived") && a.date >= now.date)
    .at(-1);
  return {
    patient,
    appointments,
    lastVisit: done[0]?.date ?? null,
    next: upcoming ?? null,
    due: done.reduce((sum, a) => sum + (a.fee - a.paid), 0),
  };
}

export function patientSummaries(state: State, query: string, nowMs: number): PatientSummary[] {
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  return state.patients
    .filter((p) => !q || p.name.toLowerCase().includes(q) || (digits.length > 0 && p.phone.includes(digits)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => summarise(state, p, nowMs));
}

export function patientDetail(state: State, id: string, nowMs: number): PatientDetail | null {
  const p = state.patients.find((x) => x.id === id);
  return p ? summarise(state, p, nowMs) : null;
}

/**
 * Messages the desk should send: a confirmation for each new online booking,
 * a reminder the evening before, and one two hours before. Only what is due
 * within the next day is listed.
 */
export function reminders(state: State, clinic: Clinic, nowMs: number): Reminder[] {
  const out: Reminder[] = [];
  const horizon = nowMs + 24 * 3600000;
  for (const a of state.appointments) {
    const start = toEpoch(a.date, a.time);
    if (a.status !== "booked" || start <= nowMs) continue;
    const v = view(state, a);
    const add = (kind: Reminder["kind"], dueAt: number) => {
      const id = `${a.id}:${kind}`;
      out.push({ id, kind, appointment: v, dueAt, text: messageText(kind, v, clinic), openedAt: state.opened[id] ?? null });
    };
    if (a.source === "online" && a.createdAt >= state.seededAt) add("confirm", a.createdAt);
    const twoHour = start - 2 * 3600000;
    const evening = toEpoch(addDays(a.date, -1), 19 * 60);
    // The evening reminder says "tomorrow", so it is only good until midnight.
    if (a.createdAt <= evening && evening <= horizon && nowMs < toEpoch(a.date, 0)) add("evening", evening);
    if (a.createdAt <= twoHour && twoHour <= horizon) add("twohour", twoHour);
  }
  return out.sort((a, b) => a.dueAt - b.dueAt);
}

export function stats(state: State, nowMs: number): Stats {
  const today = nowIST(nowMs).date;
  const weekStart = startOfWeek(today);
  let patientsToday = 0, noShowsThisWeek = 0, collectedToday = 0;
  for (const a of state.appointments) {
    if (a.status === "cancelled") continue;
    if (a.date === today) {
      patientsToday++;
      collectedToday += a.paid;
    }
    if (a.status === "no_show" && a.date >= weekStart && a.date <= today) noShowsThisWeek++;
  }
  return { patientsToday, noShowsThisWeek, collectedToday };
}
