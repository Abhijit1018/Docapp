import type { Lang, Specialty } from "../clinic";
import type { DateStr } from "../time";

export type Status = "booked" | "arrived" | "in_consultation" | "done" | "no_show" | "cancelled";
export type Source = "online" | "phone" | "walkin";

export interface Note {
  id: string;
  date: DateStr;
  text: string;
}

export interface Patient {
  id: string;
  name: string;
  /** Ten digits. */
  phone: string;
  lang: Lang;
  /** Seeded patients have made-up numbers; the desk never dials or messages them directly. */
  fictional: boolean;
  notes: Note[];
}

export interface Appointment {
  id: string;
  date: DateStr;
  time: number;
  patientId: string;
  serviceId: string;
  status: Status;
  source: Source;
  bookedFor?: string;
  fee: number;
  paid: number;
  createdAt: number;
}

export interface AppointmentView extends Appointment {
  patient: Patient;
}

export interface Block {
  id: string;
  date: DateStr;
  start: number;
  end: number;
  reason: string;
}

export interface Slot {
  date: DateStr;
  time: number;
  state: "open" | "taken" | "blocked" | "past";
}

export interface PatientSummary {
  patient: Patient;
  lastVisit: DateStr | null;
  next: Appointment | null;
  due: number;
}

export interface PatientDetail extends PatientSummary {
  appointments: Appointment[];
}

export type ReminderKind = "confirm" | "evening" | "twohour";

export interface Reminder {
  id: string;
  kind: ReminderKind;
  appointment: AppointmentView;
  dueAt: number;
  text: string;
  /** When the receptionist opened it in WhatsApp. Not a delivery receipt. */
  openedAt: number | null;
}

export interface Stats {
  patientsToday: number;
  noShowsThisWeek: number;
  collectedToday: number;
}

export interface BookInput {
  date: DateStr;
  time: number;
  serviceId: string;
  name: string;
  phone: string;
  bookedFor?: string;
  lang?: Lang;
  source: Source;
}

export type ChangeEvent =
  | { type: "booked"; appointmentId: string; source: Source; date: DateStr }
  | { type: "change" }
  | { type: "reset" };

export class SlotTakenError extends Error {
  constructor() {
    super("slot_taken");
    this.name = "SlotTakenError";
  }
}

/**
 * Everything the screens know about data. The demo ships an in-browser
 * implementation (local.ts); a Supabase one can replace it without touching
 * the screens.
 */
export interface ClinicData {
  listSlots(date: DateStr): Promise<Slot[]>;
  /** The next few open slots from now, soonest first. */
  nextOpenSlots(limit: number): Promise<Slot[]>;
  bookSlot(input: BookInput): Promise<AppointmentView>;
  listAppointments(from: DateStr, to: DateStr): Promise<AppointmentView[]>;
  getAppointment(id: string): Promise<AppointmentView | null>;
  setStatus(id: string, status: Status): Promise<void>;
  moveAppointment(id: string, date: DateStr, time: number): Promise<void>;
  recordPayment(id: string, amount: number): Promise<void>;
  listBlocks(from: DateStr, to: DateStr): Promise<Block[]>;
  blockTime(input: Omit<Block, "id">): Promise<void>;
  unblock(id: string): Promise<void>;
  listPatients(query?: string): Promise<PatientSummary[]>;
  getPatient(id: string): Promise<PatientDetail | null>;
  addNote(patientId: string, text: string): Promise<void>;
  listReminders(): Promise<Reminder[]>;
  markReminderOpened(id: string): Promise<void>;
  getStats(): Promise<Stats>;
  reset(): Promise<void>;
  subscribe(listener: (e: ChangeEvent) => void): () => void;
}

export interface State {
  v: 2;
  specialty: Specialty;
  seedDate: DateStr;
  seededAt: number;
  patients: Patient[];
  appointments: Appointment[];
  blocks: Block[];
  opened: Record<string, number>;
}
