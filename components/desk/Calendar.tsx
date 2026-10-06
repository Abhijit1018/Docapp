"use client";

import { useState } from "react";
import { serviceById } from "@/lib/clinic";
import { fmtDate, fmtTime, fmtWeekday } from "@/lib/i18n";
import { slotTimes } from "@/lib/data/core";
import { addDays, startOfWeek } from "@/lib/time";
import { SlotTakenError, type AppointmentView, type Block } from "@/lib/data/types";
import { useClinic, useLive } from "../ClinicProvider";
import { BackIcon, ForwardIcon } from "../icons";
import type { AddRequest } from "./AddBooking";
import { Modal, STATUS_LABEL } from "./shared";

type Selection = { kind: "appointment"; id: string } | { kind: "block"; id: string } | null;

export function Calendar({ today, nowMinutes, onAdd, onOpenPatient }: {
  today: string;
  nowMinutes: number;
  onAdd: (r: AddRequest) => void;
  onOpenPatient: (id: string) => void;
}) {
  const { clinic, data } = useClinic();
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [selection, setSelection] = useState<Selection>(null);
  const [moving, setMoving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];
  const appointments = useLive((d) => d.listAppointments(weekStart, weekEnd), [weekStart]) ?? [];
  const blocks = useLive((d) => d.listBlocks(weekStart, weekEnd), [weekStart]) ?? [];

  const validTimes = days.map((d) => new Set(slotTimes(clinic, d)));
  const times = [...new Set(days.flatMap((d) => slotTimes(clinic, d)))].sort((a, b) => a - b);
  const selected = selection?.kind === "appointment" ? appointments.find((a) => a.id === selection.id) : undefined;
  const selectedBlock = selection?.kind === "block" ? blocks.find((b) => b.id === selection.id) : undefined;
  const isPast = (date: string, time: number) => date < today || (date === today && time < nowMinutes);
  const clear = () => {
    setSelection(null);
    setMoving(false);
    setError(null);
  };

  async function moveTo(date: string, time: number) {
    if (!selected) return;
    try {
      await data.moveAppointment(selected.id, date, time);
      clear();
    } catch (err) {
      if (!(err instanceof SlotTakenError)) throw err;
      setError("That slot is no longer free. Pick another.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="mr-1 text-2xl">Week of {fmtDate(weekStart, "en").replace(/^\w+, /, "")}</h1>
          <button type="button" aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn btn-quiet btn-sm px-2"><BackIcon /></button>
          <button type="button" aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn btn-quiet btn-sm px-2"><ForwardIcon /></button>
          {weekStart !== startOfWeek(today) && (
            <button type="button" onClick={() => setWeekStart(startOfWeek(today))} className="btn btn-quiet btn-sm">This week</button>
          )}
        </div>
        <button type="button" onClick={() => setBlocking(true)} className="btn">Block time</button>
      </div>

      <div aria-live="polite" className="sticky top-0 z-10 mt-3 min-h-[3.4rem] bg-paper py-1.5">
        {selected ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-accent bg-accent-wash px-3 py-2">
            {moving ? (
              <p className="font-semibold">Pick a free slot for {selected.patient.name}.</p>
            ) : (
              <p>
                <button type="button" onClick={() => onOpenPatient(selected.patient.id)} className="font-semibold underline underline-offset-4">
                  {selected.patient.name}
                </button>
                , {fmtDate(selected.date, "en")} at {fmtTime(selected.time)}, {serviceById(clinic, selected.serviceId).name.en} ({STATUS_LABEL[selected.status]})
              </p>
            )}
            {error && <p role="alert" className="font-medium text-missed">{error}</p>}
            <span className="ml-auto flex gap-2">
              {!moving && selected.status === "booked" && !isPast(selected.date, selected.time) && (
                <>
                  <button type="button" onClick={() => setMoving(true)} className="btn btn-sm">Move</button>
                  <button
                    type="button"
                    onClick={() => data.setStatus(selected.id, "cancelled").then(clear)}
                    className="btn btn-sm"
                  >
                    Cancel appointment
                  </button>
                </>
              )}
              <button type="button" onClick={clear} className="btn btn-quiet btn-sm">{moving ? "Stop moving" : "Close"}</button>
            </span>
          </div>
        ) : selectedBlock ? (
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-line-strong bg-surface px-3 py-2">
            <p>
              <span className="font-semibold">Blocked: {selectedBlock.reason}</span>, {fmtDate(selectedBlock.date, "en")}, {fmtTime(selectedBlock.start)} to {fmtTime(selectedBlock.end)}
            </p>
            <span className="ml-auto flex gap-2">
              <button type="button" onClick={() => data.unblock(selectedBlock.id).then(clear)} className="btn btn-sm">Unblock</button>
              <button type="button" onClick={clear} className="btn btn-quiet btn-sm">Close</button>
            </span>
          </div>
        ) : (
          <p className="px-1 py-2 text-ink-soft">Select an appointment to move or cancel it. Select a free slot to book it.</p>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[46rem] table-fixed border-collapse text-[0.82rem]">
          <thead>
            <tr>
              <th className="w-[4.6rem] border-b border-line" />
              {days.map((d) => (
                <th key={d} scope="col" className={`border-b border-l border-line px-1 py-2 text-left font-semibold ${d === today ? "bg-accent-wash" : ""}`}>
                  {fmtWeekday(d, "en")} <span className="wide-digits font-normal">{Number(d.slice(8))}</span>
                  {d === today && <span className="font-normal"> (today)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time, row) => (
              <tr key={time} className={row > 0 && time - times[row - 1] > clinic.slotMinutes ? "border-t-[6px] border-paper" : ""}>
                <th scope="row" className="wide-digits border-b border-line px-2 text-right font-normal text-ink-soft">{fmtTime(time)}</th>
                {days.map((date, col) => (
                  <td key={date} className="h-9 border-b border-l border-line p-0.5">
                    <Cell
                      appointment={appointments.find((a) => a.date === date && a.time === time)}
                      block={blocks.find((b) => b.date === date && time >= b.start && time < b.end)}
                      valid={validTimes[col].has(time)}
                      past={isPast(date, time)}
                      moving={moving}
                      selectedId={selection?.id}
                      label={`${fmtDate(date, "en")} ${fmtTime(time)}`}
                      firstOfBlock={(b) => b.start === time}
                      onAppointment={(a) => { setSelection({ kind: "appointment", id: a.id }); setMoving(false); setError(null); }}
                      onBlock={(b) => { setSelection({ kind: "block", id: b.id }); setMoving(false); }}
                      onFree={() => (moving ? moveTo(date, time) : onAdd({ date, time, source: "phone" }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blocking && <BlockDialog today={today} defaultDate={weekStart > today ? weekStart : today} onClose={() => setBlocking(false)} />}
    </div>
  );
}

function Cell({ appointment, block, valid, past, moving, selectedId, label, firstOfBlock, onAppointment, onBlock, onFree }: {
  appointment?: AppointmentView;
  block?: Block;
  valid: boolean;
  past: boolean;
  moving: boolean;
  selectedId?: string;
  label: string;
  firstOfBlock: (b: Block) => boolean;
  onAppointment: (a: AppointmentView) => void;
  onBlock: (b: Block) => void;
  onFree: () => void;
}) {
  const base = "block h-8 w-full truncate rounded-sm px-1.5 text-left";
  if (appointment) {
    const tone =
      appointment.status === "no_show" ? "text-ink-soft line-through"
      : appointment.status === "done" ? "text-ink-soft"
      : appointment.status === "in_consultation" ? "bg-accent font-semibold text-surface"
      : appointment.status === "arrived" ? "bg-arrived-wash font-semibold text-arrived"
      : "border border-line-strong font-semibold";
    return (
      <button
        type="button"
        onClick={() => onAppointment(appointment)}
        aria-label={`${appointment.patient.name}, ${label}, ${STATUS_LABEL[appointment.status]}`}
        className={`${base} ${tone} ${selectedId === appointment.id ? "outline-2 outline-accent" : ""}`}
      >
        {appointment.patient.name}
      </button>
    );
  }
  if (!valid) return <span className="block h-8 rounded-sm bg-paper" />;
  if (block) {
    return (
      <button
        type="button"
        onClick={() => onBlock(block)}
        aria-label={`Blocked, ${block.reason}, ${label}`}
        className={`${base} bg-[repeating-linear-gradient(135deg,var(--color-line)_0_2px,transparent_2px_7px)] font-medium ${selectedId === block.id ? "outline-2 outline-accent" : ""}`}
      >
        {firstOfBlock(block) && <span className="rounded-sm bg-surface px-1">{block.reason}</span>}
      </button>
    );
  }
  if (past) return <span className="block h-8" />;
  return (
    <button
      type="button"
      onClick={onFree}
      aria-label={`${moving ? "Move to" : "Book"} ${label}`}
      className={`${base} text-center text-ink-soft ${moving ? "border border-dashed border-accent bg-accent-wash text-accent" : "opacity-0 hover:bg-paper hover:opacity-100 focus-visible:opacity-100"}`}
    >
      {moving ? "Move here" : "+ Book"}
    </button>
  );
}

function BlockDialog({ today, defaultDate, onClose }: { today: string; defaultDate: string; onClose: () => void }) {
  const { clinic, data } = useClinic();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const [date, setDate] = useState(defaultDate);
  const times = slotTimes(clinic, date);
  const ends = times.map((t) => t + clinic.slotMinutes);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [reason, setReason] = useState("Lunch");
  const from = start !== null && times.includes(start) ? start : times[0];
  const validEnds = ends.filter((e) => e > from);
  const to = end !== null && validEnds.includes(end) ? end : validEnds[0];
  const clash = useLive((d) => d.listAppointments(date, date), [date])?.filter((a) => a.time >= from && a.time < to && a.status === "booked").length ?? 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (from === undefined || to === undefined) return;
    await data.blockTime({ date, start: from, end: to, reason: reason.trim() || "Blocked" });
    onClose();
  }

  return (
    <Modal title="Block time" onClose={onClose}>
      <form onSubmit={save} className="mt-4 grid gap-4">
        <div>
          <label htmlFor="bl-day" className="label">Day</label>
          <select id="bl-day" className="field field-sm" value={date} onChange={(e) => setDate(e.target.value)}>
            {days.map((d) => <option key={d} value={d}>{fmtDate(d, "en")}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="bl-from" className="label">From</label>
            <select id="bl-from" className="field field-sm wide-digits" value={from} onChange={(e) => setStart(Number(e.target.value))}>
              {times.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bl-to" className="label">To</label>
            <select id="bl-to" className="field field-sm wide-digits" value={to} onChange={(e) => setEnd(Number(e.target.value))}>
              {validEnds.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="bl-reason" className="label">Reason</label>
          <input id="bl-reason" className="field field-sm" list="bl-reasons" value={reason} onChange={(e) => setReason(e.target.value)} />
          <datalist id="bl-reasons">
            <option value="Lunch" />
            <option value="Leave" />
            <option value="Emergency" />
          </datalist>
        </div>
        {clash > 0 && (
          <p className="rounded-sm bg-accent-wash px-3 py-2">
            {clash} {clash === 1 ? "appointment is" : "appointments are"} already booked in this time. {clash === 1 ? "It stays" : "They stay"} booked; move or cancel {clash === 1 ? "it" : "them"} from the calendar.
          </p>
        )}
        <button type="submit" className="btn btn-primary">Block this time</button>
      </form>
    </Modal>
  );
}
