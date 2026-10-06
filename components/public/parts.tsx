"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { rupees, type Clinic, type Service } from "@/lib/clinic";
import { fmtDay, fmtTime, fmtTimeAt, fmtUntil, fmtWeekday, type TKey } from "@/lib/i18n";
import { whatsappLink } from "@/lib/messages";
import { addDays, nowIST, weekday } from "@/lib/time";
import type { Slot } from "@/lib/data/types";
import { useClinic, useLive, useNow } from "../ClinicProvider";
import { ArrowIcon, ChatIcon, PhoneIcon, QuoteIcon, StarIcon } from "../icons";

export function doctorInitials(clinic: Clinic): string {
  return clinic.doctor.replace(/^dr\.?\s*/i, "").replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
}

/** A photo that fills its (relatively positioned) parent. Photos are atmosphere, so they carry no alt text. */
export function Photo({ src, sizes, priority, quality, className = "" }: {
  src: string; sizes: string; priority?: boolean; quality?: number; className?: string;
}) {
  return <Image src={src} alt="" fill sizes={sizes} priority={priority} quality={quality} className={`object-cover ${className}`} />;
}

/** "Open now, till 9:00 PM" or when the doors next open. */
export function OpenStatus({ serverNow, className = "" }: { serverNow: number; className?: string }) {
  const { clinic, t, lang } = useClinic();
  const now = nowIST(useNow(serverNow));
  const session = clinic.hours[weekday(now.date)].find(([open, close]) => now.minutes >= open && now.minutes < close);
  let opens: { date: string; time: number } | null = null;
  for (let off = 0; off < 8 && !opens && !session; off++) {
    const date = addDays(now.date, off);
    const s = clinic.hours[weekday(date)].find(([open]) => off > 0 || open > now.minutes);
    if (s) opens = { date, time: s[0] };
  }
  return (
    <p className={`flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${session ? "animate-pulse-dot bg-teal" : "border-2 border-line-strong"}`} />
      {session
        ? t("openNow", { until: fmtUntil(session[1], lang) })
        : opens && t("closedNow", { day: fmtDay(opens.date, lang, now.date), time: fmtTimeAt(opens.time, lang) })}
    </p>
  );
}

export function ContactActions({ className = "" }: { className?: string }) {
  const { clinic, t } = useClinic();
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <a href={`tel:${clinic.phone ? "+91" + clinic.phone : ""}`} className="btn">
        <PhoneIcon /> {t("call")}
      </a>
      <a href={whatsappLink(t("waHello", { clinic: clinic.name }), clinic.phone)} target="_blank" rel="noopener" className="btn">
        <ChatIcon /> {t("whatsapp")}
      </a>
    </div>
  );
}

function useNextSlots(initialSlots: Slot[], serverNow: number, serviceId?: string) {
  const { href } = useClinic();
  const today = nowIST(useNow(serverNow)).date;
  const slots = useLive((d) => d.nextOpenSlots(5), [], initialSlots);
  const link = (s?: Slot) => {
    const extra: Record<string, string> = {};
    if (s) extra.slot = `${s.date}.${s.time}`;
    if (serviceId) extra.service = serviceId;
    return href("/book", extra);
  };
  return { today, slots, link };
}

/** The small live card that floats over the hero photo: the next free time, one tap from booking. */
export function HeroSlot({ initialSlots, serverNow }: { initialSlots: Slot[]; serverNow: number }) {
  const { t, lang } = useClinic();
  const { today, slots, link } = useNextSlots(initialSlots, serverNow);
  const next = slots[0];
  return (
    <div className="w-[15.5rem] rounded-lg border border-line bg-surface p-4 shadow-float" aria-live="polite">
      <p className="flex items-center gap-2 text-[0.88rem] font-semibold text-teal">
        <span aria-hidden="true" className="size-2 animate-pulse-dot rounded-full bg-teal" /> {t("nextAvailable")}
      </p>
      {next ? (
        <>
          <p className="mt-1.5 text-[0.94rem] font-semibold">{fmtDay(next.date, lang, today)}</p>
          <p className="wide-digits font-[family-name:var(--font-display)] text-[2.1rem] font-extrabold leading-none tracking-tight text-accent">
            {fmtTime(next.time, lang)}
          </p>
        </>
      ) : (
        <p className="mt-1.5 text-[0.94rem]">{t("noSlots")}</p>
      )}
      <Link href={link(next)} className="btn btn-primary btn-sm mt-3 min-h-11 w-full">{t("book")}</Link>
    </div>
  );
}

/** A row of other free times, each a link straight into booking. */
export function SlotChips({ initialSlots, serverNow, serviceId, skipFirst }: {
  initialSlots: Slot[]; serverNow: number; serviceId?: string; skipFirst?: boolean;
}) {
  const { lang } = useClinic();
  const { today, slots, link } = useNextSlots(initialSlots, serverNow, serviceId);
  const shown = skipFirst ? slots.slice(1) : slots.slice(0, 4);
  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((s) => (
        <li key={s.date + s.time}>
          <Link href={link(s)} className="btn btn-quiet wide-digits min-h-11 gap-1.5 bg-surface px-3 text-[0.94rem]">
            <span className="font-normal text-ink-soft">{fmtDay(s.date, lang, today)}</span>
            {fmtTime(s.time, lang)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Counts up to its value the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1400);
        setShown(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  const text = decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString("en-IN");
  return <span ref={ref} className="wide-digits">{text}{suffix}</span>;
}

export function Stats({ className = "" }: { className?: string }) {
  const { clinic, t } = useClinic();
  const items: [React.ReactNode, string][] = [
    [<CountUp key="y" value={clinic.years} suffix="+" />, t("statYears")],
    [<CountUp key="p" value={clinic.patientsSeen} suffix="+" />, t("statPatients")],
    [<><CountUp value={clinic.rating} decimals={1} /><StarIcon className="mb-1 ml-1 inline text-[#e8a400]" width={22} height={22} /></>, t("statRating")],
  ];
  return (
    <dl className={`grid grid-cols-3 gap-4 ${className}`}>
      {items.map(([value, label]) => (
        <div key={label} className="flex flex-col-reverse">
          <dt className="text-[0.9rem] leading-snug text-ink-soft">{label}</dt>
          <dd className="font-[family-name:var(--font-display)] text-[1.7rem] font-extrabold tracking-tight lg:text-[2.2rem]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A service as a photo card that opens its own page. */
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { clinic, t, lang, href } = useClinic();
  return (
    <Link href={href(`/services/${service.id}`)} className="card lift group flex h-full flex-col overflow-hidden">
      <div className="zoom relative aspect-[16/10]">
        <Photo src={clinic.photos[index % 4]} sizes="(min-width: 1024px) 360px, 92vw" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.15rem]">{service.name[lang]}</h3>
        <p className="mt-1.5 flex-1 text-ink-soft">{service.about[lang]}</p>
        <p className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
          <span className="wide-digits text-xl font-bold">{rupees(service.fee)}</span>
          <span className="nudge flex items-center gap-1.5 font-semibold text-accent">{t("details")} <ArrowIcon width={18} height={18} /></span>
        </p>
      </div>
    </Link>
  );
}

const REVIEWERS = ["Kavita S.", "Imran P.", "Bhavna P.", "Rajesh P.", "Nisha J.", "Harsh D."];

export function Reviews({ count }: { count: number }) {
  const { t } = useClinic();
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {REVIEWERS.slice(0, count).map((name, i) => (
        <li key={name} className="rise card flex flex-col p-6">
          <QuoteIcon className="text-accent" width={30} height={30} />
          <p className="mt-3 flex-1 text-[1.05rem] leading-relaxed">{t(`rev${i + 1}` as TKey)}</p>
          <p className="mt-5 flex items-center gap-3 border-t border-line pt-4">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-accent-wash font-bold text-accent">{name[0]}</span>
            <span className="leading-tight">
              <span className="block font-semibold">{name}</span>
              <span className="flex items-center gap-1 text-[0.85rem] text-ink-soft">
                <span className="flex text-[#e8a400]" role="img" aria-label="5 out of 5">
                  {[0, 1, 2, 3, 4].map((n) => <StarIcon key={n} width={13} height={13} />)}
                </span>
                {t("patient")}
              </span>
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function Timings({ serverNow }: { serverNow: number }) {
  const { clinic, t, lang } = useClinic();
  const today = nowIST(useNow(serverNow)).date;
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - ((weekday(today) + 6) % 7)));
  return (
    <table className="wide-digits w-full border-collapse">
      <tbody>
        {week.map((date) => {
          const isToday = date === today;
          const sessions = clinic.hours[weekday(date)];
          return (
            <tr key={date} className={isToday ? "bg-accent-wash font-semibold" : "border-b border-line last:border-0"}>
              <th scope="row" className="w-[44%] rounded-l-sm py-2 pl-3 text-left align-top font-[inherit]">
                {fmtWeekday(date, lang, "long")}
                {isToday && <span className="font-normal"> ({t("today")})</span>}
              </th>
              <td className="rounded-r-sm py-2 pr-3">
                {sessions.length === 0
                  ? t("closed")
                  : sessions.map(([open, close]) => (
                      <span key={open} className="block">{fmtTime(open, lang)} – {fmtTime(close, lang)}</span>
                    ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function Faq() {
  const { clinic, t, lang } = useClinic();
  const faqs: [string, string][] = [
    [t("faqFeeQ"), t("faqFeeA", { fee: rupees(clinic.services[0].fee) })],
    [t("faqBringQ"), clinic.bring[lang]],
    [t("faqParkQ"), t("faqParkA")],
    [t("faqChangeQ"), t("faqChangeA")],
  ];
  return (
    <div className="card px-5">
      {faqs.map(([q, a]) => (
        <details key={q} className="group border-b border-line last:border-0">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-2 font-semibold [&::-webkit-details-marker]:hidden">
            {q}
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-wash text-xl font-normal leading-none text-accent transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="max-w-[40rem] pb-4 text-ink-soft">{a}</p>
        </details>
      ))}
    </div>
  );
}

/** The closing band on every page: a photo of the clinic under the brand blue, and one button. */
export function CtaBand() {
  const { clinic, t, href } = useClinic();
  return (
    <section className="wrap py-12 lg:py-16">
      <div className="rise relative isolate overflow-hidden rounded-[1.75rem] bg-accent-deep px-6 py-12 text-surface lg:px-14 lg:py-16">
        <Photo src={clinic.photos[4]} sizes="(min-width: 1024px) 1080px, 100vw" className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(8_74_150/0.96)_35%,rgb(8_74_150/0.72))]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="h-section max-w-[30rem]">{t("ctaTitle")}</h2>
            <p className="mt-2 text-lg text-[#d6e6fa]">{t("ctaSub")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={href("/book")} className="btn nudge min-h-14 border-surface px-7 text-[1.05rem] text-accent">
              {t("book")} <ArrowIcon />
            </Link>
            <a href={`tel:${clinic.phone ? "+91" + clinic.phone : ""}`} className="btn min-h-14 border-[#7fa9dc] bg-transparent px-6 text-[1.05rem] text-surface hover:bg-[#0b5fbf]">
              <PhoneIcon /> {t("call")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A headline whose words climb into place one after another. */
export function WordReveal({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, n) => (
        <Fragment key={n}>
          <span className="word-clip"><span className="word" style={{ "--i": n } as React.CSSProperties}>{word}</span></span>{" "}
        </Fragment>
      ))}
    </>
  );
}

/** The banner at the top of an inner page: a drifting photo under the brand blue, with the title rising in. */
export function PageHead({ title, sub, photo, children }: { title: string; sub?: string; photo?: string; children?: React.ReactNode }) {
  const { clinic } = useClinic();
  return (
    <div className="relative isolate overflow-hidden bg-ink text-surface">
      <div className="absolute inset-x-0 -inset-y-[10%] -z-20" data-parallax="90">
        <Photo src={photo ?? clinic.photos[5]} sizes="100vw" priority quality={62} className="kenburns" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(7_22_44/0.94)_0%,rgb(8_52_110/0.82)_50%,rgb(8_52_110/0.3)_100%)]" />
      <div className="wrap flex min-h-[19rem] flex-col justify-end py-10 lg:min-h-[24rem] lg:py-14">
        <h1 className="max-w-[20ch] text-[2.2rem] leading-[1.1] lg:text-[3.7rem] lg:leading-[1.05]">
          <WordReveal text={title} />
        </h1>
        {sub && <p className="enter mt-4 max-w-[40rem] text-lg text-[#d6e6fa]" style={{ "--i": 5 } as React.CSSProperties}>{sub}</p>}
        {children && <div className="enter mt-6" style={{ "--i": 7 } as React.CSSProperties}>{children}</div>}
      </div>
    </div>
  );
}

export function SectionHead({ id, title, sub, action }: { id?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="rise flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h2 id={id} className="h-section">{title}</h2>
        {sub && <p className="mt-2 max-w-[36rem] text-lg text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link href={to} className="nudge inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline">
      {children} <ArrowIcon width={18} height={18} />
    </Link>
  );
}
