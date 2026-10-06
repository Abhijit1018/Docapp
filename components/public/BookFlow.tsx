"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { rupees, serviceById } from "@/lib/clinic";
import { fmtDate, fmtDay, fmtTime, fmtWeekday, type TKey } from "@/lib/i18n";
import { calendarFile, messageText } from "@/lib/messages";
import { addDays, nowIST } from "@/lib/time";
import { SlotTakenError, type AppointmentView, type Slot, type Status } from "@/lib/data/types";
import { useClinic, useLive, useNow } from "../ClinicProvider";
import { BackIcon, CalendarIcon, CheckIcon } from "../icons";
import { LangSwitch } from "../LangSwitch";

type Step = 1 | 2 | 3 | "done";

const STATUS_KEY: Record<Status, TKey> = {
  booked: "stBooked", arrived: "stArrived", in_consultation: "stIn", done: "stDone", no_show: "stMissed", cancelled: "stCancelled",
};

function parseSlot(raw: string | undefined): { date: string; time: number } | null {
  const m = raw?.match(/^(\d{4}-\d{2}-\d{2})\.(\d{1,4})$/);
  return m ? { date: m[1], time: Number(m[2]) } : null;
}

export function BookFlow({ slot, service: presetService, day, serverNow }: { slot?: string; service?: string; day?: string; serverNow: number }) {
  const { clinic, data, t, lang, href } = useClinic();
  const today = nowIST(useNow(serverNow)).date;
  const preset = parseSlot(slot);

  const knownService = clinic.services.some((x) => x.id === presetService) ? presetService! : null;

  const [step, setStep] = useState<Step>(knownService ? (preset ? 3 : 2) : 1);
  const [serviceId, setServiceId] = useState<string | null>(knownService);
  const [date, setDate] = useState(preset?.date ?? (day && /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today ? day : today));
  const [time, setTime] = useState<number | null>(preset?.time ?? null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [other, setOther] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const week = useLive((d) => Promise.all(days.map((day) => d.listSlots(day))), [today]);
  const booked = useLive((d) => (bookedId ? d.getAppointment(bookedId) : Promise.resolve(null)), [bookedId]);
  const daySlots = week?.[days.indexOf(date)] ?? [];
  const open = daySlots.filter((s) => s.state === "open");

  // Each step starts at its heading, for screen readers and for small screens.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step]);

  // If the first day has nothing left, start on the first day that does.
  useEffect(() => {
    if (!week || time !== null || open.length > 0) return;
    const i = week.findIndex((slots) => slots.some((s) => s.state === "open"));
    if (i >= 0) setDate(days[i]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week === undefined]);

  const service = serviceId ? serviceById(clinic, serviceId) : null;

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    let digits = phone.replace(/\D/g, "");
    if (digits.length > 10) digits = digits.replace(/^(91|0)/, "");
    const found = {
      name: name.trim().length < 2 ? t("errName") : undefined,
      phone: /^[6-9]\d{9}$/.test(digits) ? undefined : t("errMobile"),
    };
    setErrors(found);
    if (found.name || found.phone || !service || time === null) {
      document.getElementById(found.name ? "bk-name" : "bk-phone")?.focus();
      return;
    }
    setBusy(true);
    try {
      const a = await data.bookSlot({ date, time, serviceId: service.id, name, phone: digits, bookedFor: other, lang, source: "online" });
      setBookedId(a.id);
      setStep("done");
    } catch (err) {
      if (!(err instanceof SlotTakenError)) throw err;
      setNotice(t("slotTaken"));
      setTime(null);
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  const steps: [1 | 2 | 3, string][] = [[1, t("stepService")], [2, t("stepTime")], [3, t("stepDetails")]];
  const backTo = step === 2 ? 1 : step === 3 ? 2 : null;

  return (
    <div className="mx-auto min-h-dvh max-w-[560px] px-5 pb-10">
      <header className="flex items-center justify-between gap-3 py-3">
        {backTo ? (
          <button type="button" onClick={() => setStep(backTo)} className="btn btn-quiet px-3">
            <BackIcon /> {t("back")}
          </button>
        ) : (
          <Link href={href("/")} className="btn btn-quiet min-w-0 justify-start px-3">
            <BackIcon className="shrink-0" /> <span className="truncate">{clinic.name}</span>
          </Link>
        )}
        <LangSwitch />
      </header>

      {step !== "done" && (
        <ol className="mt-2 flex gap-2 text-[0.94rem]">
          {steps.map(([n, label]) => (
            <li
              key={n}
              aria-current={step === n ? "step" : undefined}
              className={`flex-1 border-t-4 pt-1.5 ${step === n ? "border-accent font-semibold" : n < step ? "border-accent text-ink-soft" : "border-line text-ink-soft"}`}
            >
              <span className="wide-digits">{n}.</span> {label}
            </li>
          ))}
        </ol>
      )}

      {step === 1 && (
        <section className="mt-7">
          <h1 ref={heading} tabIndex={-1} className="text-2xl outline-none">{t("chooseService")}</h1>
          {preset && time !== null && (
            <p className="mt-2 font-medium">{fmtDay(date, lang, today)}, {fmtTime(time, lang)}</p>
          )}
          <ul className="mt-5 grid gap-3">
            {clinic.services.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(time !== null ? 3 : 2);
                  }}
                  className={`btn w-full min-h-16 justify-between whitespace-normal py-2 text-left ${serviceId === s.id ? "bg-accent-wash" : ""}`}
                >
                  <span>{s.name[lang]}</span>
                  <span className="wide-digits shrink-0">{rupees(s.fee)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 2 && (
        <section className="mt-7">
          <h1 ref={heading} tabIndex={-1} className="text-2xl outline-none">{t("chooseTime")}</h1>
          {notice && <p role="alert" className="mt-3 rounded-md border-[1.5px] border-missed bg-missed-wash px-3 py-2 font-medium">{notice}</p>}

          <div className="-mx-5 mt-5 overflow-x-auto px-5 pb-2">
            <ul className="flex w-max gap-2">
              {days.map((day, i) => {
                const free = week?.[i]?.filter((s) => s.state === "open").length ?? 0;
                const chosen = day === date;
                return (
                  <li key={day}>
                    <button
                      type="button"
                      aria-pressed={chosen}
                      disabled={week !== undefined && free === 0}
                      onClick={() => {
                        setDate(day);
                        setTime(null);
                      }}
                      className={`btn min-h-16 min-w-[4.6rem] flex-col gap-0.5 px-2 ${chosen ? "btn-ink" : ""}`}
                    >
                      <span className="text-[0.88rem] font-medium">{i < 2 ? fmtDay(day, lang, today) : fmtWeekday(day, lang)}</span>
                      <span className="wide-digits text-lg leading-none">{Number(day.slice(8))}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-4 font-semibold">{fmtDate(date, lang)}</p>
          {week !== undefined && open.length === 0 && <p className="mt-3 text-ink-soft">{t("noSlotsDay")}</p>}
          <SlotGroup label={t("morning")} slots={open.filter((s) => s.time < 840)} lang={lang} chosen={time} onPick={pick} />
          <SlotGroup label={t("evening")} slots={open.filter((s) => s.time >= 840)} lang={lang} chosen={time} onPick={pick} />
        </section>
      )}

      {step === 3 && service && time !== null && (
        <section className="mt-7">
          <h1 ref={heading} tabIndex={-1} className="text-2xl outline-none">{t("stepDetails")}</h1>
          <Summary
            rows={[
              [fmtDay(date, lang, today) + ", " + fmtTime(time, lang), () => setStep(2)],
              [`${service.name[lang]}, ${rupees(service.fee)} (${t("payAtClinic")})`, () => setStep(1)],
            ]}
            changeLabel={t("change")}
          />
          <form onSubmit={confirm} noValidate className="mt-6 grid gap-5">
            <div>
              <label htmlFor="bk-name" className="label">{t("yourName")}</label>
              <input
                id="bk-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? "bk-name-err" : undefined}
              />
              {errors.name && <p id="bk-name-err" className="mt-1 font-medium text-missed">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="bk-phone" className="label">{t("mobile")}</label>
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="wide-digits font-semibold">+91</span>
                <input
                  id="bk-phone" className="field wide-digits" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14}
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "bk-phone-err" : "bk-phone-hint"}
                />
              </div>
              {errors.phone ? (
                <p id="bk-phone-err" className="mt-1 font-medium text-missed">{errors.phone}</p>
              ) : (
                <p id="bk-phone-hint" className="mt-1 text-[0.9rem] text-ink-soft">{t("mobileHint")}</p>
              )}
            </div>
            <div>
              <label htmlFor="bk-other" className="label font-medium">{t("forSomeone")}</label>
              <input id="bk-other" className="field" autoComplete="off" value={other} onChange={(e) => setOther(e.target.value)} />
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary min-h-14 text-lg">{t("confirmBooking")}</button>
          </form>
        </section>
      )}

      {step === "done" && booked && <Confirmation booked={booked} headingRef={heading} today={today} />}
    </div>
  );

  function pick(s: Slot) {
    setTime(s.time);
    setNotice(null);
    setStep(3);
  }
}

function SlotGroup({ label, slots, lang, chosen, onPick }: {
  label: string; slots: Slot[]; lang: "en" | "hi" | "gu"; chosen: number | null; onPick: (s: Slot) => void;
}) {
  if (slots.length === 0) return null;
  return (
    <div className="mt-4">
      <h2 className="text-base font-medium text-ink-soft">{label}</h2>
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {slots.map((s) => (
          <li key={s.time}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className={`btn wide-digits w-full px-1 ${chosen === s.time ? "btn-primary" : ""}`}
            >
              {fmtTime(s.time, "en").replace(/ [AP]M$/, lang === "en" ? "$&" : "")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Summary({ rows, changeLabel }: { rows: [string, () => void][]; changeLabel: string }) {
  return (
    <ul className="mt-4 rounded-md border border-line-strong bg-surface">
      {rows.map(([text, onChange], i) => (
        <li key={i} className={`flex items-center justify-between gap-3 py-1.5 pl-4 pr-1.5 ${i ? "border-t border-line" : ""}`}>
          <span className="font-medium">{text}</span>
          <button type="button" onClick={onChange} className="min-h-11 shrink-0 px-2.5 font-semibold underline underline-offset-4">
            {changeLabel}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Confirmation({ booked, headingRef, today }: {
  booked: AppointmentView; headingRef: React.RefObject<HTMLHeadingElement | null>; today: string;
}) {
  const { clinic, t, lang, href } = useClinic();
  const service = serviceById(clinic, booked.serviceId);
  const cancelled = booked.status === "cancelled";

  function addToCalendar() {
    const url = URL.createObjectURL(new Blob([calendarFile(booked, clinic, lang)], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "clinic-visit.ics" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <section className="mt-6">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-teal text-surface">
        <CheckIcon width={26} height={26} strokeWidth={2.6} />
      </span>
      <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl outline-none">{t("bookedTitle")}</h1>

      <div className="mt-5 rounded-md border border-line-strong bg-surface p-4">
        <p className="text-lg font-semibold">{fmtDay(booked.date, lang, today)}</p>
        <p className="wide-digits text-[2.6rem] font-bold leading-[1.1] tracking-tight">{fmtTime(booked.time, lang)}</p>
        <p className="mt-2 font-medium">{clinic.doctor}</p>
        <p>{clinic.name}, {clinic.area}</p>
        <p className="mt-2">{service.name[lang]}, {rupees(booked.fee)} ({t("payAtClinic")})</p>
        <p>{booked.bookedFor ? t("forPerson", { name: booked.bookedFor }) : booked.patient.name}</p>
        <p
          aria-live="polite"
          className={`mt-3 inline-block rounded-sm px-2 py-1 font-semibold ${
            cancelled || booked.status === "no_show" ? "bg-missed-wash text-missed"
            : booked.status === "booked" ? "bg-paper"
            : "bg-accent-wash"
          }`}
        >
          {t(STATUS_KEY[booked.status])}
        </p>
      </div>

      {!cancelled && (
        <button type="button" onClick={addToCalendar} className="btn mt-4 w-full">
          <CalendarIcon /> {t("addCal")}
        </button>
      )}

      <h2 className="mt-8 text-base">{t("waPreview")}</h2>
      <p className="mt-2 max-w-[26rem] whitespace-pre-line rounded-lg rounded-tl-sm border border-line bg-surface px-3.5 py-2.5">
        {messageText("confirm", booked, clinic, lang)}
      </p>
      <p className="mt-2 text-[0.9rem] text-ink-soft">{t("waDemoNote")}</p>

      <Link href={href("/")} className="btn btn-quiet mt-8">{t("backHome")}</Link>
    </section>
  );
}
