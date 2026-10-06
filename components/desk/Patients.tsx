"use client";

import { useState } from "react";
import { formatPhone, rupees, serviceById } from "@/lib/clinic";
import { fmtDate, fmtDay, fmtTime } from "@/lib/i18n";
import { useClinic, useLive } from "../ClinicProvider";
import { BackIcon, SearchIcon } from "../icons";
import { StatusPill } from "./shared";

export function Patients({ today, patientId, onSelect }: {
  today: string;
  patientId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const patients = useLive((d) => d.listPatients(query), [query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className={patientId ? "hidden xl:block" : ""}>
        <h1 className="text-2xl">Patients</h1>
        <div className="relative mt-3">
          <label htmlFor="pt-search" className="sr-only">Search by name or mobile number</label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            id="pt-search" type="search" className="field field-sm pl-10" placeholder="Name or mobile number"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ul className="mt-3 rounded-md border border-line bg-surface">
          {patients?.map(({ patient, lastVisit, next, due }) => (
            <li key={patient.id} className="border-b border-line last:border-0">
              <button
                type="button"
                onClick={() => onSelect(patient.id)}
                aria-current={patient.id === patientId ? "true" : undefined}
                className={`grid w-full grid-cols-[1fr_auto] gap-x-3 px-4 py-2.5 text-left hover:bg-paper ${patient.id === patientId ? "bg-accent-wash hover:bg-accent-wash" : ""}`}
              >
                <span className="font-semibold">{patient.name}</span>
                <span className="wide-digits text-right text-[0.85rem] text-ink-soft">{formatPhone(patient.phone)}</span>
                <span className="text-[0.85rem] text-ink-soft">
                  {next ? `Next: ${fmtDay(next.date, "en", today)}, ${fmtTime(next.time)}` : lastVisit ? `Last visit ${fmtDate(lastVisit, "en")}` : "No visits yet"}
                </span>
                {due > 0 && <span className="wide-digits text-right text-[0.85rem] font-semibold text-missed">Owes {rupees(due)}</span>}
              </button>
            </li>
          ))}
          {patients?.length === 0 && (
            <li className="px-4 py-8 text-center text-ink-soft">No patient matches “{query}”. Check the spelling or search by mobile number.</li>
          )}
        </ul>
      </div>

      {patientId ? (
        <PatientPage id={patientId} today={today} onBack={() => onSelect(null)} />
      ) : (
        <p className="hidden self-start rounded-md border border-dashed border-line-strong px-4 py-10 text-center text-ink-soft xl:block">
          Select a patient to see their visits, notes and dues.
        </p>
      )}
    </div>
  );
}

function PatientPage({ id, today, onBack }: { id: string; today: string; onBack: () => void }) {
  const { clinic, data } = useClinic();
  const detail = useLive((d) => d.getPatient(id), [id]);
  const [note, setNote] = useState("");
  if (!detail) return null;
  const { patient, appointments, next, due } = detail;

  const visits = appointments.filter((a) => a.date <= today && a.status !== "booked");
  const dates = [...new Set([...visits.map((a) => a.date), ...patient.notes.map((n) => n.date)])].sort().reverse();
  const unpaid = appointments.filter((a) => a.status === "done" && a.paid < a.fee);

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await data.addNote(patient.id, note);
    setNote("");
  }

  return (
    <article>
      <button type="button" onClick={onBack} className="btn btn-quiet btn-sm mb-3 xl:hidden"><BackIcon /> All patients</button>
      <h2 className="text-2xl">{patient.name}</h2>
      <p className="wide-digits text-ink-soft">{formatPhone(patient.phone)}</p>

      <dl className="mt-4 grid gap-x-10 gap-y-3 rounded-md border border-line bg-surface px-4 py-3 sm:grid-cols-2">
        <div>
          <dt className="text-[0.85rem] text-ink-soft">Next appointment</dt>
          <dd className="font-semibold">
            {next ? `${fmtDay(next.date, "en", today)}, ${fmtTime(next.time)} (${serviceById(clinic, next.serviceId).name.en})` : "None booked"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.85rem] text-ink-soft">Owes</dt>
          <dd className={`wide-digits font-semibold ${due > 0 ? "text-missed" : ""}`}>
            {due > 0 ? rupees(due) : "Nothing"}
            {due > 0 && (
              <button
                type="button"
                onClick={() => Promise.all(unpaid.map((a) => data.recordPayment(a.id, a.fee)))}
                className="btn btn-sm ml-3 text-ink"
              >
                Mark {rupees(due)} paid
              </button>
            )}
          </dd>
        </div>
      </dl>

      <form onSubmit={saveNote} className="mt-5">
        <label htmlFor="pt-note" className="label">Add a note for today</label>
        <textarea
          id="pt-note" className="field" value={note} onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && e.currentTarget.form?.requestSubmit()}
        />
        <button type="submit" disabled={!note.trim()} className="btn btn-sm mt-2">Save note</button>
      </form>

      <h3 className="mt-7 text-lg">Visits and notes</h3>
      {dates.length === 0 && <p className="mt-2 text-ink-soft">No visits yet. The first one will appear here.</p>}
      <ol className="mt-2">
        {dates.map((date) => (
          <li key={date} className="border-t border-line py-3">
            <p className="font-semibold">{date === today ? "Today" : fmtDate(date, "en")}</p>
            {visits.filter((a) => a.date === date).map((a) => (
              <p key={a.id} className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="wide-digits">{fmtTime(a.time)}, {serviceById(clinic, a.serviceId).name.en}</span>
                <StatusPill status={a.status} />
                {a.status === "done" && (
                  <span className={`wide-digits text-[0.85rem] ${a.paid < a.fee ? "font-semibold text-missed" : "text-ink-soft"}`}>
                    {rupees(a.fee)} {a.paid < a.fee ? "not paid" : "paid"}
                  </span>
                )}
              </p>
            ))}
            {patient.notes.filter((n) => n.date === date).map((n) => (
              <p key={n.id} className="mt-1.5 max-w-[38rem] rounded-sm bg-paper px-3 py-2">{n.text}</p>
            ))}
          </li>
        ))}
      </ol>
    </article>
  );
}
