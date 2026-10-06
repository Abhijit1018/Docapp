"use client";

import { useEffect, useState } from "react";
import { rupees } from "@/lib/clinic";
import { fmtDayInline, fmtTime } from "@/lib/i18n";
import { nowIST } from "@/lib/time";
import type { AppointmentView } from "@/lib/data/types";
import { useClinic, useLive, useNow } from "../ClinicProvider";
import { ResetIcon } from "../icons";
import { AddBooking, type AddRequest } from "./AddBooking";
import { Calendar } from "./Calendar";
import { Patients } from "./Patients";
import { Reminders } from "./Reminders";
import { Today } from "./Today";

type View = "today" | "calendar" | "patients" | "reminders";
const VIEWS: [View, string][] = [["today", "Today"], ["calendar", "Calendar"], ["patients", "Patients"], ["reminders", "Reminders"]];

export function DeskApp({ serverNow, pitch }: { serverNow: number; pitch: boolean }) {
  const { clinic, data } = useClinic();
  const now = useNow(serverNow);
  const { date: today, minutes } = nowIST(now);

  const [view, setView] = useState<View>("today");
  const [day, setDay] = useState(today);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [adding, setAdding] = useState<AddRequest | null>(null);
  const [arrival, setArrival] = useState<AppointmentView | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useLive((d) => d.getStats(), []);
  const dueCount = useLive((d) => d.listReminders(), [])?.filter((r) => !r.openedAt && r.dueAt <= now).length ?? 0;

  // A booking made on the website lands here without a reload.
  useEffect(
    () =>
      data.subscribe((e) => {
        if (e.type === "reset") {
          setArrival(null);
          setFresh(new Set());
          setDay(nowIST().date);
          setView("today");
        } else if (e.type === "booked" && e.source === "online") {
          data.getAppointment(e.appointmentId).then((a) => {
            if (!a) return;
            setArrival(a);
            setFresh((s) => new Set(s).add(a.id));
            // In a pitch the desk follows the booking, so the doctor sees it land.
            if (pitch) {
              setView("today");
              setDay(a.date);
            }
            setTimeout(() => setFresh((s) => new Set([...s].filter((id) => id !== a.id))), 8000);
          });
        }
      }),
    [data, pitch],
  );

  const openPatient = (id: string) => {
    setPatientId(id);
    setView("patients");
  };

  return (
    <div className="min-h-dvh text-[0.94rem] lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)]">
      <aside className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface px-4 py-2 lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:flex-nowrap lg:items-stretch lg:border-b-0 lg:border-r lg:px-3 lg:py-4">
        <div className="lg:px-2 lg:pb-4">
          <p className="font-semibold leading-tight">{clinic.name}</p>
          <p className="text-[0.85rem] text-ink-soft">Front desk</p>
        </div>
        <nav aria-label="Front desk" className="flex gap-1 lg:flex-col">
          {VIEWS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-current={view === id ? "page" : undefined}
              onClick={() => setView(id)}
              className={`flex min-h-11 items-center justify-between gap-2 rounded-sm px-3 text-left font-medium lg:min-h-10 ${view === id ? "bg-accent text-surface" : "hover:bg-paper"}`}
            >
              {label}
              {id === "reminders" && dueCount > 0 && (
                <span className="wide-digits rounded-full bg-accent px-1.5 text-[0.78rem] font-bold text-surface">
                  {dueCount}<span className="sr-only"> due</span>
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="ml-auto lg:ml-0 lg:mt-auto lg:px-2">
          {confirmReset ? (
            <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
              <span className="text-[0.85rem]">Restore the seeded day?</span>
              <button type="button" onClick={() => data.reset().then(() => setConfirmReset(false))} className="btn btn-sm btn-ink">Yes, reset</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-quiet btn-sm">Keep</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-quiet btn-sm w-full">
              <ResetIcon width={16} height={16} /> Reset demo
            </button>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-b border-line px-5 py-2.5">
          <dl className="wide-digits flex flex-wrap gap-x-7 gap-y-1">
            <Number label="Patients today" value={stats ? String(stats.patientsToday) : "–"} />
            <Number label="No-shows this week" value={stats ? String(stats.noShowsThisWeek) : "–"} />
            <Number label="Collected today" value={stats ? rupees(stats.collectedToday) : "–"} />
          </dl>
          <p className="rounded-sm border border-line-strong px-2 py-0.5 text-[0.82rem] font-medium">Demo data, patients are fictional</p>
        </div>

        {arrival && (
          <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-accent px-5 text-surface py-2.5">
            <p>
              <span className="font-bold">New online booking.</span> {arrival.patient.name}, {fmtDayInline(arrival.date, today)} at {fmtTime(arrival.time)}
            </p>
            <span className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setView("today");
                  setDay(arrival.date);
                }}
                className="btn btn-sm"
              >
                Show in list
              </button>
              <button type="button" onClick={() => setArrival(null)} className="btn btn-sm">Dismiss</button>
            </span>
          </div>
        )}

        <main className="px-5 py-5">
          {view === "today" && (
            <Today day={day} setDay={setDay} today={today} nowMinutes={minutes} fresh={fresh} onAdd={() => setAdding({})} onOpenPatient={openPatient} />
          )}
          {view === "calendar" && <Calendar today={today} nowMinutes={minutes} onAdd={setAdding} onOpenPatient={openPatient} />}
          {view === "patients" && <Patients today={today} patientId={patientId} onSelect={setPatientId} />}
          {view === "reminders" && <Reminders today={today} now={now} />}
        </main>
      </div>

      {adding && <AddBooking request={adding} today={today} onClose={() => setAdding(null)} />}
    </div>
  );
}

function Number({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  );
}
