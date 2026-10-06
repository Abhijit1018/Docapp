// The demo's data layer: state lives in localStorage, so the phone frame and
// the desk in /pitch (and any second tab) read the same day. Writes go
// through a Web Lock, which is what makes a double booking impossible across
// tabs; a BroadcastChannel tells the other screens to re-read.

import type { Clinic } from "../clinic";
import { nowIST } from "../time";
import {
  appointmentsBetween, daySlots, isTaken, nextOpenSlots, patientDetail, patientSummaries, reminders, seedState,
  slotTimes, stats, view,
} from "./core";
import { SlotTakenError, type ChangeEvent, type ClinicData, type Patient, type State } from "./types";

const listeners = new Set<(e: ChangeEvent) => void>();
let channel: BroadcastChannel | null = null;
let wired = false;

function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  const notify = (e: ChangeEvent) => listeners.forEach((fn) => fn(e));
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel("clinicdesk");
    channel.onmessage = (m) => notify(m.data as ChangeEvent);
  }
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("clinicdesk:")) notify({ type: "change" });
  });
}

function emit(e: ChangeEvent) {
  listeners.forEach((fn) => fn(e));
  channel?.postMessage(e);
}

function withLock<T>(fn: () => T): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks)
    return navigator.locks.request("clinicdesk-write", () => fn()) as Promise<T>;
  return Promise.resolve().then(fn);
}

const uid = (prefix: string) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function createLocalData(clinic: Clinic): ClinicData {
  const key = `clinicdesk:v2:${clinic.specialty}`;
  let cacheRaw: string | null = null;
  let cache: State | null = null;

  function save(state: State) {
    cache = state;
    cacheRaw = JSON.stringify(state);
    try {
      localStorage.setItem(key, cacheRaw);
    } catch {
      // Private mode or full storage: the demo still works in this tab.
    }
  }

  function load(): State {
    if (typeof window === "undefined") return seedState(clinic, Date.now());
    wire();
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {}
    if (raw && raw === cacheRaw && cache) return cache;
    let state: State | null = null;
    try {
      state = raw ? (JSON.parse(raw) as State) : null;
    } catch {}
    // A new day gets a new seeded day.
    if (!state || state.v !== 2 || state.seedDate !== nowIST().date) {
      if (!raw && cache && cache.seedDate === nowIST().date) return cache;
      state = seedState(clinic, Date.now());
      save(state);
      return state;
    }
    cache = state;
    cacheRaw = raw;
    return state;
  }

  const read = <T,>(fn: (s: State) => T): Promise<T> => Promise.resolve().then(() => fn(load()));

  function write<T>(fn: (s: State) => T, event: (result: T) => ChangeEvent = () => ({ type: "change" })): Promise<T> {
    return withLock(() => {
      const state = structuredClone(load());
      const result = fn(state);
      save(state);
      emit(event(result));
      return result;
    });
  }

  const find = (s: State, id: string) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a) throw new Error("Appointment not found");
    return a;
  };

  function assertOpen(s: State, date: string, time: number, exceptId?: string) {
    const valid = slotTimes(clinic, date).includes(time);
    const blocked = s.blocks.some((b) => b.date === date && time >= b.start && time < b.end);
    if (!valid || blocked || isTaken(s, date, time, exceptId)) throw new SlotTakenError();
  }

  return {
    listSlots: (date) => read((s) => daySlots(s, clinic, date, Date.now())),
    nextOpenSlots: (limit) => read((s) => nextOpenSlots(s, clinic, Date.now(), limit)),

    bookSlot: (input) =>
      write(
        (s) => {
          assertOpen(s, input.date, input.time);
          const name = input.name.trim();
          let patient: Patient | undefined = s.patients.find(
            (p) => p.phone === input.phone && p.name.toLowerCase() === name.toLowerCase(),
          );
          if (!patient) {
            patient = { id: uid("p"), name, phone: input.phone, lang: input.lang ?? "en", fictional: false, notes: [] };
            s.patients.push(patient);
          }
          const service = clinic.services.find((x) => x.id === input.serviceId) ?? clinic.services[0];
          const walkIn = input.source === "walkin";
          const appointment = {
            id: uid("a"),
            date: input.date,
            time: input.time,
            patientId: patient.id,
            serviceId: service.id,
            status: walkIn ? ("arrived" as const) : ("booked" as const),
            source: input.source,
            bookedFor: input.bookedFor?.trim() || undefined,
            fee: service.fee,
            paid: 0,
            createdAt: Date.now(),
          };
          s.appointments.push(appointment);
          return view(s, appointment);
        },
        (a) => ({ type: "booked", appointmentId: a.id, source: a.source, date: a.date }),
      ),

    listAppointments: (from, to) => read((s) => appointmentsBetween(s, from, to)),
    getAppointment: (id) =>
      read((s) => {
        const a = s.appointments.find((x) => x.id === id);
        return a ? view(s, a) : null;
      }),

    setStatus: (id, status) =>
      write((s) => {
        const a = find(s, id);
        a.status = status;
        // Most patients pay as they leave; the desk un-ticks the ones who do not.
        a.paid = status === "done" ? a.fee : 0;
      }),

    moveAppointment: (id, date, time) =>
      write((s) => {
        assertOpen(s, date, time, id);
        Object.assign(find(s, id), { date, time });
      }),

    recordPayment: (id, amount) =>
      write((s) => {
        find(s, id).paid = amount;
      }),

    listBlocks: (from, to) => read((s) => s.blocks.filter((b) => b.date >= from && b.date <= to)),
    blockTime: (input) =>
      write((s) => {
        s.blocks.push({ ...input, id: uid("b") });
      }),
    unblock: (id) =>
      write((s) => {
        s.blocks = s.blocks.filter((b) => b.id !== id);
      }),

    listPatients: (query = "") => read((s) => patientSummaries(s, query, Date.now())),
    getPatient: (id) => read((s) => patientDetail(s, id, Date.now())),
    addNote: (patientId, text) =>
      write((s) => {
        s.patients.find((p) => p.id === patientId)?.notes.push({ id: uid("n"), date: nowIST().date, text: text.trim() });
      }),

    listReminders: () => read((s) => reminders(s, clinic, Date.now())),
    markReminderOpened: (id) =>
      write((s) => {
        s.opened[id] = Date.now();
      }),

    getStats: () => read((s) => stats(s, Date.now())),

    reset: () =>
      withLock(() => {
        save(seedState(clinic, Date.now()));
        emit({ type: "reset" });
      }),

    subscribe(listener) {
      wire();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
