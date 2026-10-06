"use client";

import { useState } from "react";
import { rupees } from "@/lib/clinic";
import { fmtDay, fmtTime } from "@/lib/i18n";
import { addDays } from "@/lib/time";
import { SlotTakenError, type Source } from "@/lib/data/types";
import { useClinic, useLive } from "../ClinicProvider";
import { Modal, normalisePhone } from "./shared";

export interface AddRequest {
  date?: string;
  time?: number;
  source?: Source;
}

/**
 * Walk-in or phone booking. Built for speed: the cursor starts in the name
 * box, a walk-in takes the next free slot today without being asked, and
 * Enter saves.
 */
export function AddBooking({ request, today, onClose }: { request: AddRequest; today: string; onClose: () => void }) {
  const { clinic, data } = useClinic();
  const [source, setSource] = useState<Source>(request.source ?? (request.date ? "phone" : "walkin"));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(clinic.services[0].id);
  const [date, setDate] = useState(request.date ?? today);
  const [time, setTime] = useState<number | null>(request.time ?? null);
  const [error, setError] = useState<string | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const effectiveDate = source === "walkin" ? today : date;
  const slots = useLive((d) => d.listSlots(effectiveDate), [effectiveDate]);
  const open = slots?.filter((s) => s.state === "open") ?? [];
  const chosen = time !== null && open.some((s) => s.time === time) ? time : (open[0]?.time ?? null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const digits = normalisePhone(phone);
    if (name.trim().length < 2) return setError("Enter the patient's name.");
    if (!digits) return setError("Enter a 10-digit mobile number.");
    if (chosen === null) return setError("No free slot on this day. Pick another day.");
    try {
      await data.bookSlot({ date: effectiveDate, time: chosen, serviceId, name, phone: digits, source });
      onClose();
    } catch (err) {
      if (!(err instanceof SlotTakenError)) throw err;
      setError("That slot was just taken. Pick another time.");
    }
  }

  return (
    <Modal title="Add a booking" onClose={onClose}>
      <form onSubmit={save} noValidate className="mt-4 grid gap-4">
        <fieldset>
          <legend className="label">Type</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["walkin", "phone"] as const).map((s) => (
              <label key={s} className={`btn btn-sm min-h-11 ${source === s ? "btn-ink" : "btn-quiet"}`}>
                <input type="radio" name="source" className="sr-only" checked={source === s} onChange={() => setSource(s)} />
                {s === "walkin" ? "Walk-in (here now)" : "Phone booking"}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="ab-name" className="label">Patient name</label>
          <input id="ab-name" className="field field-sm" autoFocus autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ab-phone" className="label">Mobile number</label>
          <input id="ab-phone" className="field field-sm wide-digits" type="tel" inputMode="numeric" autoComplete="off" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ab-service" className="label">Visit</label>
          <select id="ab-service" className="field field-sm" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {clinic.services.map((s) => (
              <option key={s.id} value={s.id}>{s.name.en} ({rupees(s.fee)})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {source === "phone" && (
            <div>
              <label htmlFor="ab-day" className="label">Day</label>
              <select id="ab-day" className="field field-sm" value={date} onChange={(e) => { setDate(e.target.value); setTime(null); }}>
                {days.map((d) => <option key={d} value={d}>{fmtDay(d, "en", today)}</option>)}
              </select>
            </div>
          )}
          <div className={source === "walkin" ? "col-span-2" : ""}>
            <label htmlFor="ab-time" className="label">{source === "walkin" ? "Slot today" : "Time"}</label>
            <select id="ab-time" className="field field-sm wide-digits" value={chosen ?? ""} disabled={open.length === 0} onChange={(e) => setTime(Number(e.target.value))}>
              {open.length === 0 && <option value="">No free slots</option>}
              {open.map((s, i) => (
                <option key={s.time} value={s.time}>{fmtTime(s.time)}{i === 0 ? " (next free)" : ""}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p role="alert" className="font-medium text-missed">{error}</p>}
        <button type="submit" className="btn btn-primary">
          {source === "walkin" ? "Add walk-in" : "Add phone booking"}
        </button>
      </form>
    </Modal>
  );
}
