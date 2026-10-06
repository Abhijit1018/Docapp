"use client";

import { formatPhone, rupees, serviceById } from "@/lib/clinic";
import { fmtDate, fmtTime } from "@/lib/i18n";
import { addDays } from "@/lib/time";
import type { AppointmentView, Status } from "@/lib/data/types";
import { useClinic, useLive } from "../ClinicProvider";
import { BackIcon, ForwardIcon, PlusIcon } from "../icons";
import { DESK_STATUSES, SOURCE_LABEL, STATUS_LABEL, StatusPill } from "./shared";

const NEXT_STEP: Partial<Record<Status, [Status, string]>> = {
  booked: ["arrived", "Mark arrived"],
  arrived: ["in_consultation", "Send in"],
  in_consultation: ["done", "Done"],
};

export function Today({ day, setDay, today, nowMinutes, fresh, onAdd, onOpenPatient }: {
  day: string;
  setDay: (d: string) => void;
  today: string;
  nowMinutes: number;
  /** Appointments that just arrived from the website; they flash once. */
  fresh: Set<string>;
  onAdd: () => void;
  onOpenPatient: (id: string) => void;
}) {
  const { clinic, data } = useClinic();
  const appointments = useLive((d) => d.listAppointments(day, day), [day]);
  const list = appointments ?? [];
  const isToday = day === today;

  const withDoctor = isToday ? list.find((a) => a.status === "in_consultation") : undefined;
  const next = isToday
    ? (list.find((a) => a.status === "arrived") ?? list.find((a) => a.status === "booked" && a.time + clinic.slotMinutes > nowMinutes))
    : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="mr-1 text-2xl">{isToday ? "Today" : fmtDate(day, "en")}</h1>
          <button type="button" aria-label="Previous day" onClick={() => setDay(addDays(day, -1))} className="btn btn-quiet btn-sm px-2"><BackIcon /></button>
          <button type="button" aria-label="Next day" onClick={() => setDay(addDays(day, 1))} className="btn btn-quiet btn-sm px-2"><ForwardIcon /></button>
          {!isToday && <button type="button" onClick={() => setDay(today)} className="btn btn-quiet btn-sm">Back to today</button>}
          {isToday && <span className="text-ink-soft">{fmtDate(day, "en")}</span>}
        </div>
        <button type="button" onClick={onAdd} className="btn btn-primary">
          <PlusIcon /> Add walk-in or phone booking
        </button>
      </div>

      {isToday && (
        <dl className="mt-4 grid gap-x-10 gap-y-2 rounded-md border border-line bg-surface px-4 py-3 sm:grid-cols-2">
          <div>
            <dt className="text-[0.85rem] text-ink-soft">With the doctor now</dt>
            <dd className="font-semibold">{withDoctor ? <>{withDoctor.patient.name} <span className="font-normal text-ink-soft">since {fmtTime(withDoctor.time)}</span></> : "Nobody"}</dd>
          </div>
          <div>
            <dt className="text-[0.85rem] text-ink-soft">Next patient</dt>
            <dd className="font-semibold">
              {next
                ? <>{next.patient.name} <span className="font-normal text-ink-soft">{next.status === "arrived" ? "is waiting" : `booked for ${fmtTime(next.time)}, not here yet`}</span></>
                : "Nobody waiting"}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[0.85rem] text-ink-soft">
              <th scope="col" className="w-24 py-2 pl-4 font-medium">Time</th>
              <th scope="col" className="py-2 font-medium">Patient</th>
              <th scope="col" className="py-2 font-medium">Visit</th>
              <th scope="col" className="py-2 font-medium">Status</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Change status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <Row
                key={a.id}
                a={a}
                isNext={a.id === next?.id}
                isFresh={fresh.has(a.id)}
                onOpenPatient={onOpenPatient}
                onStatus={(s) => data.setStatus(a.id, s)}
                onPaid={(amount) => data.recordPayment(a.id, amount)}
              />
            ))}
          </tbody>
        </table>
        {appointments && list.length === 0 && (
          <p className="px-4 py-8 text-center text-ink-soft">No appointments on this day. Add a walk-in or a phone booking to start the list.</p>
        )}
      </div>
    </div>
  );
}

function Row({ a, isNext, isFresh, onOpenPatient, onStatus, onPaid }: {
  a: AppointmentView;
  isNext: boolean;
  isFresh: boolean;
  onOpenPatient: (id: string) => void;
  onStatus: (s: Status) => void;
  onPaid: (amount: number) => void;
}) {
  const { clinic } = useClinic();
  const step = NEXT_STEP[a.status];
  const finished = a.status === "done" || a.status === "no_show";
  return (
    <tr className={`border-b border-line last:border-0 ${isNext ? "bg-accent-wash" : ""} ${isFresh ? "animate-arrive" : ""}`}>
      <td className="wide-digits py-2.5 pl-4 align-top font-semibold">
        {fmtTime(a.time)}
        {isNext && <span className="mt-0.5 block w-fit rounded-sm bg-accent px-1.5 text-surface text-[0.75rem] font-bold">Next</span>}
        {isFresh && <span className="mt-0.5 block w-fit rounded-sm border border-accent bg-surface px-1.5 text-accent text-[0.75rem] font-bold">New</span>}
      </td>
      <td className="py-2.5 pr-3 align-top">
        <button
          type="button"
          onClick={() => onOpenPatient(a.patient.id)}
          className={`text-left font-semibold underline decoration-line-strong underline-offset-4 hover:decoration-ink ${a.status === "no_show" ? "text-ink-soft line-through" : ""}`}
        >
          {a.patient.name}
        </button>
        <span className="wide-digits block text-[0.85rem] text-ink-soft">
          {formatPhone(a.patient.phone)}
          {a.bookedFor && `, for ${a.bookedFor}`}
        </span>
      </td>
      <td className={`py-2.5 pr-3 align-top ${finished ? "text-ink-soft" : ""}`}>
        {serviceById(clinic, a.serviceId).name.en}
        <span className="block text-[0.85rem] text-ink-soft">{SOURCE_LABEL[a.source]}, {rupees(a.fee)}</span>
      </td>
      <td className="py-2.5 pr-3 align-top">
        <StatusPill status={a.status} />
        {a.status === "done" && (
          <button
            type="button"
            onClick={() => onPaid(a.paid >= a.fee ? 0 : a.fee)}
            aria-pressed={a.paid >= a.fee}
            title="Tap to switch between paid and not paid"
            className={`wide-digits mt-1 block text-[0.85rem] font-medium underline underline-offset-4 ${a.paid >= a.fee ? "text-ink-soft" : "text-missed"}`}
          >
            {a.paid >= a.fee ? `${rupees(a.fee)} paid` : `${rupees(a.fee)} not paid`}
          </button>
        )}
      </td>
      <td className="py-2 pr-4 align-top">
        <div className="flex items-center justify-end gap-2">
          {step && (
            <button type="button" onClick={() => onStatus(step[0])} className={`btn btn-sm ${isNext || a.status === "in_consultation" ? "btn-primary" : ""}`}>
              {step[1]}
            </button>
          )}
          {a.status === "booked" && (
            <button type="button" onClick={() => onStatus("no_show")} className="btn btn-quiet btn-sm">No-show</button>
          )}
          <select
            aria-label={`Set status for ${a.patient.name}`}
            value={a.status}
            onChange={(e) => onStatus(e.target.value as Status)}
            className="field field-sm w-auto min-w-0 px-2"
          >
            {DESK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </td>
    </tr>
  );
}
