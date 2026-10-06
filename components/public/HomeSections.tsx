"use client";

import Link from "next/link";
import { LANGS, fmtTime, fmtWeekday, type TKey } from "@/lib/i18n";
import { messageText } from "@/lib/messages";
import { addDays, nowIST } from "@/lib/time";
import type { AppointmentView, ReminderKind } from "@/lib/data/types";
import { useClinic, useLive, useNow } from "../ClinicProvider";
import { ArrowIcon, CheckIcon, CrossIcon, PhoneIcon, PinIcon } from "../icons";
import { doctorInitials, Photo, SectionHead } from "./parts";

/** Seven days, each showing how many times are still free. Live: a booking anywhere lowers the count. */
export function WeekBoard({ serverNow }: { serverNow: number }) {
  const { t, lang, href } = useClinic();
  const today = nowIST(useNow(serverNow)).date;
  const days = Array.from({ length: 7 }, (_, n) => addDays(today, n));
  const week = useLive((d) => Promise.all(days.map((day) => d.listSlots(day))), [today]);

  return (
    <section className="wrap pt-14 lg:pt-20" aria-labelledby="week">
      <SectionHead id="week" title={t("weekHeading")} sub={t("weekSub")} />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day, n) => {
          const slots = week?.[n] ?? [];
          const total = slots.length;
          const free = slots.filter((s) => s.state === "open").length;
          const first = slots.find((s) => s.state === "open");
          const label = n === 0 ? t("today") : n === 1 ? t("tomorrow") : fmtWeekday(day, lang, "long");
          return (
            <li key={day} className="rise">
              <Link
                href={href("/book", { day })}
                aria-disabled={week !== undefined && free === 0}
                className={`card lift block h-full p-4 ${n === 0 ? "border-accent bg-accent-wash" : ""} ${week !== undefined && free === 0 ? "pointer-events-none opacity-55" : ""}`}
              >
                <span className="block text-[0.9rem] font-semibold text-ink-soft">{label}</span>
                <span className="wide-digits block font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-tight">{Number(day.slice(8))}</span>
                <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-line">
                  <span className="block h-full rounded-full bg-teal transition-[width] duration-700" style={{ width: total ? `${(free / total) * 100}%` : "0%" }} />
                </span>
                <span className={`wide-digits mt-2 block font-semibold ${free ? "text-teal" : "text-ink-soft"}`}>
                  {week === undefined ? "…" : free ? t("nFree", { n: free }) : total ? t("full") : t("closed")}
                </span>
                {first && <span className="wide-digits block text-[0.85rem] text-ink-soft">{fmtTime(first.time, lang)}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Conditions() {
  const { clinic, t, lang, href } = useClinic();
  return (
    <section className="wrap pb-14 lg:pb-20" aria-labelledby="conditions">
      <div className="rise rounded-[1.75rem] bg-accent-wash p-6 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
          <div>
            <h2 id="conditions" className="h-section">{t("condHeading")}</h2>
            <p className="mt-3 text-lg text-ink-soft">{t("condSub")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={href("/book")} className="btn btn-primary shine nudge min-h-13 px-6">{t("book")} <ArrowIcon /></Link>
              <a href={`tel:${clinic.phone ? "+91" + clinic.phone : ""}`} className="btn min-h-13 px-5"><PhoneIcon /> {t("call")}</a>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {clinic.conditions.map((c) => (
              <li key={c.en} className="rise rounded-full border border-line bg-surface px-4 py-2.5 font-semibold shadow-card">{c[lang]}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const WALK: TKey[] = ["walk1", "walk2", "walk3"];
const BOOK: TKey[] = ["book1", "book2", "book3"];

export function Compare() {
  const { t } = useClinic();
  return (
    <section className="wrap pb-14 lg:pb-20" aria-labelledby="compare">
      <h2 id="compare" className="rise h-section text-center">{t("cmpHeading")}</h2>
      <div className="mx-auto mt-9 grid max-w-[56rem] gap-5 md:grid-cols-2">
        <div className="rise card p-6 lg:p-8">
          <h3 className="text-xl text-ink-soft">{t("cmpWalk")}</h3>
          <ul className="mt-5 grid gap-4">
            {WALK.map((key) => (
              <li key={key} className="flex items-start gap-3 text-ink-soft">
                <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-missed-wash text-missed"><CrossIcon width={14} height={14} strokeWidth={3} /></span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rise rounded-lg bg-accent p-6 text-surface shadow-float lg:p-8">
          <h3 className="text-xl">{t("cmpBook")}</h3>
          <ul className="mt-5 grid gap-4">
            {BOOK.map((key) => (
              <li key={key} className="flex items-start gap-3 font-semibold">
                <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface text-accent"><CheckIcon width={14} height={14} strokeWidth={3} /></span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const MESSAGES: ReminderKind[] = ["confirm", "evening", "twohour"];

/** The three WhatsApp messages a patient receives, shown as a chat on a phone. */
export function WhatsAppPreview({ serverNow }: { serverNow: number }) {
  const { clinic, t, lang } = useClinic();
  const today = nowIST(useNow(serverNow)).date;
  const service = clinic.services[0];
  const sample: AppointmentView = {
    id: "sample", date: addDays(today, 1), time: 1050, patientId: "sample", serviceId: service.id, status: "booked", source: "online",
    fee: service.fee, paid: 0, createdAt: 0,
    patient: { id: "sample", name: "Kavita", phone: "", lang, fictional: true, notes: [] },
  };
  return (
    <section className="border-y border-line bg-paper" aria-labelledby="whatsapp">
      <div className="wrap grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="rise">
          <h2 id="whatsapp" className="h-section">{t("waHeading")}</h2>
          <p className="mt-3 max-w-[30rem] text-lg text-ink-soft">{t("waSub")}</p>
          <ul className="mt-6 grid gap-3">
            {(["factConfirm", "why4", "faqChangeA"] as TKey[]).map((key) => (
              <li key={key} className="flex items-start gap-2.5 font-medium">
                <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal text-surface"><CheckIcon width={13} height={13} strokeWidth={3} /></span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rise mx-auto w-full max-w-[22rem] rounded-[2.4rem] border-[9px] border-ink bg-[#e9e4dc] shadow-float">
          <div className="flex items-center gap-3 rounded-t-[1.8rem] bg-[#0b6156] px-4 py-3 text-surface">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-surface/20 font-bold">{doctorInitials(clinic)}</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-semibold">{clinic.name}</span>
              <span className="block text-[0.8rem] opacity-80">WhatsApp</span>
            </span>
          </div>
          <ol className="grid gap-3 px-3 py-4">
            {MESSAGES.map((kind) => (
              <li key={kind} className="rise mr-6 rounded-xl rounded-tl-sm bg-surface px-3 py-2 text-[0.88rem] leading-snug shadow-card">
                {messageText(kind, sample, clinic, lang)}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Two rows of photos sliding past each other. */
export function PhotoStrip() {
  const { clinic, t, href } = useClinic();
  const rows = [clinic.photos.slice(0, 4), clinic.photos.slice(4)];
  return (
    <section className="overflow-hidden py-14 lg:py-20" aria-labelledby="strip">
      <div className="wrap">
        <SectionHead
          id="strip" title={t("galleryTitle")} sub={t("gallerySub")}
          action={<Link href={href("/gallery")} className="nudge inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline">{t("seeGallery")} <ArrowIcon width={18} height={18} /></Link>}
        />
      </div>
      <div className="mt-8 grid gap-4" aria-hidden="true">
        {rows.map((row, r) => (
          <div key={r} className={`flex w-max gap-4 motion-reduce:animate-none ${r ? "animate-slide [animation-direction:reverse]" : "animate-slide"}`}>
            {[...row, ...row, ...row, ...row].map((src, n) => (
              <div key={n} className="relative h-44 w-72 shrink-0 overflow-hidden rounded-2xl lg:h-56 lg:w-[22rem]">
                <Photo src={src} sizes="352px" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Languages() {
  const { t, lang } = useClinic();
  const hello: Record<string, string> = { gu: "નમસ્તે", hi: "नमस्ते", en: "Hello" };
  return (
    <section className="wrap pt-14 lg:pt-20" aria-labelledby="languages">
      <div className="rise flex flex-col gap-6 rounded-[1.75rem] bg-ink px-6 py-10 text-surface lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div>
          <h2 id="languages" className="h-section">{t("langHeading")}</h2>
          <p className="mt-2 text-lg text-[#c3cfde]">{t("langSub")}</p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {["gu", "hi", "en"].map((id) => (
            // Greetings in the other scripts use the device's font, so an English
            // page does not download the Hindi and Gujarati font files for three words.
            <li key={id} lang={id} className="rise rounded-xl bg-surface/10 px-5 py-3 text-center" style={id === lang ? undefined : { fontFamily: "system-ui, sans-serif" }}>
              <span className={`block text-2xl font-bold ${id === lang ? "font-[family-name:var(--font-display)]" : ""}`}>{hello[id]}</span>
              <span className="text-[0.85rem] text-[#c3cfde]">{LANGS.find((l) => l.id === id)!.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function MapBlock() {
  const { clinic, t } = useClinic();
  const place = `${clinic.area}, ${clinic.city}`;
  return (
    <section className="wrap pb-2" aria-labelledby="map">
      <div className="rise grid overflow-hidden rounded-[1.75rem] border border-line lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div className="bg-paper p-6 lg:p-10">
          <h2 id="map" className="h-section">{t("locationHeading")}</h2>
          <p className="mt-4 text-lg">
            {clinic.name}
            <br />
            {place}
          </p>
          <a
            href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${clinic.name}, ${place}`)}
            target="_blank" rel="noopener" className="btn btn-primary mt-6"
          >
            <PinIcon /> {t("openMaps")}
          </a>
        </div>
        <iframe
          title={`${t("locationHeading")}: ${place}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(place)}&z=14&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full border-0 lg:h-full lg:min-h-[22rem]"
        />
      </div>
    </section>
  );
}
