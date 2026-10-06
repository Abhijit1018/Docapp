"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SPECIALTIES, toQuery, type ClinicParams } from "@/lib/clinic";
import { fmtDayInline, fmtTime } from "@/lib/i18n";
import { nowIST } from "@/lib/time";
import { useClinic } from "../ClinicProvider";
import { ResetIcon } from "../icons";
import { Modal } from "../desk/shared";

/** The desk is laid out for a laptop; in the split view it is scaled to fit its half. */
const DESK_WIDTH = 1010;

export function Pitch() {
  const { clinic, params, data, href } = useClinic();
  const [round, setRound] = useState(0);
  const [landed, setLanded] = useState<{ n: number; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const deskBox = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: DESK_WIDTH, h: 760 });

  useEffect(() => {
    const el = deskBox.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () =>
      data.subscribe((e) => {
        if (e.type === "reset") setLanded(null);
        if (e.type !== "booked" || e.source !== "online") return;
        data.getAppointment(e.appointmentId).then((a) => {
          if (!a) return;
          const when = `${fmtDayInline(a.date, nowIST().date)} at ${fmtTime(a.time)}`;
          setLanded((prev) => ({ n: (prev?.n ?? 0) + 1, text: `${a.patient.name} booked ${when}. It is on the desk.` }));
        });
      }),
    [data],
  );

  const scale = Math.min(1, box.w / DESK_WIDTH);
  const patientUrl = href("/");

  async function copyLink() {
    await navigator.clipboard.writeText(location.origin + patientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function reset() {
    await data.reset();
    setLanded(null);
    setRound((r) => r + 1);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-surface lg:h-dvh">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-2.5">
        <p className="font-semibold">
          {clinic.name} <span className="font-normal opacity-75">with {clinic.doctor}</span>
        </p>
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={copyLink} className="btn btn-sm">{copied ? "Link copied" : "Copy the patient link"}</button>
          <button type="button" onClick={() => setEditing(true)} className="btn btn-sm">Change clinic</button>
          <button type="button" onClick={reset} className="btn btn-sm"><ResetIcon width={16} height={16} /> Reset the day</button>
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-4 lg:flex-row lg:gap-0">
        <section aria-label="Patient's phone" className="flex shrink-0 flex-col items-center lg:w-[25rem]">
          <h2 className="pb-2 text-base font-medium">What the patient sees</h2>
          <div className="h-[44rem] w-[24.4rem] max-w-full rounded-[2.6rem] border-[10px] border-[#2b3660] bg-paper p-0 lg:h-auto lg:min-h-0 lg:flex-1">
            <iframe
              key={round}
              title="Clinic website on a phone"
              src={patientUrl}
              className="size-full rounded-[2rem]"
              // A phone has no scrollbar gutter; same-origin, so the frame can be told.
              onLoad={(e) => e.currentTarget.contentDocument?.documentElement.style.setProperty("scrollbar-width", "none")}
            />
          </div>
        </section>

        <div className="relative hidden w-16 shrink-0 lg:block" aria-hidden="true">
          <div className="absolute inset-x-1 top-1/2 border-t-2 border-dashed border-[#4a5687]" />
          {landed && (
            <span key={landed.n} className="absolute top-1/2 -ml-2 -mt-[7px] size-4 animate-travel rounded-full bg-surface" />
          )}
        </div>

        <section aria-label="Front desk" className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 pb-2">
            <h2 className="text-base font-medium">What your front desk sees</h2>
            <p role="status" className={`text-[0.94rem] ${landed ? "font-semibold text-[#a9d1ff]" : "opacity-75"}`}>
              {landed ? landed.text : "Book a visit on the phone and watch it arrive here."}
            </p>
          </div>
          <div ref={deskBox} className="h-[44rem] overflow-hidden rounded-lg bg-paper lg:h-auto lg:min-h-0 lg:flex-1">
            <iframe
              key={round}
              title="Front desk"
              src={href("/desk", { pitch: "1" })}
              style={{ width: box.w / scale, height: box.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            />
          </div>
        </section>
      </div>

      {editing && <ClinicForm params={params} onClose={() => setEditing(false)} />}
    </div>
  );
}

function ClinicForm({ params, onClose }: { params: ClinicParams; onClose: () => void }) {
  const router = useRouter();
  const { clinic } = useClinic();
  const [form, setForm] = useState<ClinicParams>({ specialty: clinic.specialty, ...params });
  const set = (k: keyof ClinicParams) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const clean: ClinicParams = {};
    for (const k in form) {
      const v = form[k as keyof ClinicParams]?.trim();
      if (v) clean[k as keyof ClinicParams] = v;
    }
    router.push("/pitch" + toQuery(clean));
    onClose();
  }

  return (
    <Modal title="Whose clinic is this pitch for?" onClose={onClose}>
      <form onSubmit={apply} className="mt-4 grid gap-4">
        <div>
          <label htmlFor="pf-clinic" className="label">Clinic name</label>
          <input id="pf-clinic" className="field field-sm" autoFocus placeholder={clinic.name} value={form.clinic ?? ""} onChange={set("clinic")} />
        </div>
        <div>
          <label htmlFor="pf-doctor" className="label">Doctor</label>
          <input id="pf-doctor" className="field field-sm" placeholder={clinic.doctor} value={form.doctor ?? ""} onChange={set("doctor")} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="pf-specialty" className="label">Specialty</label>
            <select id="pf-specialty" className="field field-sm" value={form.specialty} onChange={set("specialty")}>
              {SPECIALTIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="pf-area" className="label">Area</label>
            <input id="pf-area" className="field field-sm" placeholder={clinic.area} value={form.area ?? ""} onChange={set("area")} />
          </div>
        </div>
        <div>
          <label htmlFor="pf-phone" className="label">Clinic mobile, for the Call and WhatsApp buttons (optional)</label>
          <input id="pf-phone" className="field field-sm wide-digits" type="tel" inputMode="numeric" value={form.phone ?? ""} onChange={set("phone")} />
        </div>
        <button type="submit" className="btn btn-primary">Use this clinic</button>
      </form>
    </Modal>
  );
}
