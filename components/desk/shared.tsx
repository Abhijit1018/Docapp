"use client";

import { useEffect, useRef } from "react";
import type { Source, Status } from "@/lib/data/types";

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  arrived: "Arrived",
  in_consultation: "With doctor",
  done: "Done",
  no_show: "No-show",
  cancelled: "Cancelled",
};

export const DESK_STATUSES: Status[] = ["booked", "arrived", "in_consultation", "done", "no_show"];

export const SOURCE_LABEL: Record<Source, string> = { online: "Online", phone: "Phone", walkin: "Walk-in" };

const STATUS_STYLE: Record<Status, string> = {
  booked: "border-line-strong bg-surface text-ink",
  arrived: "border-arrived bg-arrived-wash text-arrived",
  in_consultation: "border-accent bg-accent text-surface",
  done: "border-done bg-done-wash text-done",
  no_show: "border-missed bg-missed-wash text-missed",
  cancelled: "border-line-strong bg-paper text-ink-soft",
};

/** Each status has its own shape as well as its own colour and label. */
function StatusShape({ status }: { status: Status }) {
  const common = { width: 12, height: 12, viewBox: "0 0 12 12", "aria-hidden": true } as const;
  switch (status) {
    case "booked":
      return <svg {...common}><circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "arrived":
      return <svg {...common}><circle cx="6" cy="6" r="5" fill="currentColor" /></svg>;
    case "in_consultation":
      return <svg {...common}><path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" fill="currentColor" /></svg>;
    case "done":
      return <svg {...common}><path d="M1.5 6.5 4.5 9.5 10.5 2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    default:
      return <svg {...common}><path d="M2 2l8 8M10 2 2 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  }
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.82rem] font-semibold ${STATUS_STYLE[status]}`}>
      <StatusShape status={status} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** A native modal dialog that opens when rendered and reports when it is dismissed. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="modal-title"
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-line-strong bg-surface p-0 text-ink"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-xl">{title}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="btn btn-quiet btn-sm">Close</button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function normalisePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 10) digits = digits.replace(/^(91|0)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}
