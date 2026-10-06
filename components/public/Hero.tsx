"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rupees } from "@/lib/clinic";
import { fmtDay, fmtTime } from "@/lib/i18n";
import { whatsappLink } from "@/lib/messages";
import { nowIST } from "@/lib/time";
import type { Slot } from "@/lib/data/types";
import { useClinic, useLive, useNow } from "../ClinicProvider";
import { ArrowIcon, ChatIcon, PhoneIcon } from "../icons";
import { OpenStatus, WordReveal } from "./parts";

const SLIDE_MS = 5500;

/** Photos that drift slowly and dissolve into one another, filling their parent. */
export function Slides({ photos, onChange }: { photos: string[]; onChange?: (n: number) => void }) {
  const [active, setActive] = useState(0);
  // Only the first photo is in the page to begin with; the rest arrive once it has had its moment.
  const [loaded, setLoaded] = useState(1);
  useEffect(() => {
    const warm = setTimeout(() => setLoaded(photos.length), 2200);
    const timer = setInterval(() => setActive((n) => (n + 1) % photos.length), SLIDE_MS);
    return () => {
      clearTimeout(warm);
      clearInterval(timer);
    };
  }, [photos.length]);
  useEffect(() => onChange?.(active), [active, onChange]);
  return (
    <>
      {photos.slice(0, loaded).map((src, n) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={n === 0}
          quality={62}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1400ms] ${n === active ? "kenburns opacity-100" : "opacity-0"}`}
        />
      ))}
    </>
  );
}

export function Hero({ initialSlots, serverNow }: { initialSlots: Slot[]; serverNow: number }) {
  const { clinic, t, lang, href } = useClinic();
  const [slide, setSlide] = useState(0);
  const photos = clinic.photos.slice(0, 4);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-surface">
        <div className="absolute inset-x-0 -inset-y-[8%] -z-20" data-parallax="140">
          <Slides photos={photos} onChange={setSlide} />
        </div>
        {/* On a phone the text sits over the whole photo, so the veil runs top to bottom and stays lighter. */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(7_22_44/0.5),rgb(8_44_96/0.8))] lg:bg-[linear-gradient(100deg,rgb(7_22_44/0.94)_0%,rgb(8_52_110/0.8)_46%,rgb(8_52_110/0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-[linear-gradient(to_top,rgb(7_22_44/0.85),transparent)]" />

        <div className="wrap flex min-h-[33rem] flex-col justify-end pb-40 pt-12 lg:min-h-[min(47rem,calc(100svh-6.5rem))] lg:pb-44 lg:pt-20">
          <div className="enter hidden w-fit rounded-full border border-surface/25 bg-surface/10 py-1.5 pl-3 pr-4 text-[0.92rem] font-semibold lg:block">
            <OpenStatus serverNow={serverNow} />
          </div>
          <p className="enter font-semibold text-[#9fd0ff] lg:mt-6" style={{ "--i": 1 } as React.CSSProperties}>
            {t("inArea", { kind: clinic.kind[lang], area: clinic.area, city: clinic.city })}
          </p>
          <h1 className="mt-2 max-w-[17ch] text-[2.7rem] leading-[1.06] lg:text-[5.4rem] lg:leading-[1]">
            <WordReveal text={t("heroTitle", { doctor: clinic.doctor })} />
          </h1>
          <p className="enter mt-6 max-w-[34rem] text-[1.15rem] text-[#d6e6fa]" style={{ "--i": 7 } as React.CSSProperties}>{t("heroSub")}</p>
          <div className="enter mt-7 hidden flex-wrap gap-3 lg:flex" style={{ "--i": 9 } as React.CSSProperties}>
            <a href={`tel:${clinic.phone ? "+91" + clinic.phone : ""}`} className="btn min-h-13 border-surface/40 bg-transparent px-6 text-surface hover:bg-surface/15">
              <PhoneIcon /> {t("call")}
            </a>
            <a href={whatsappLink(t("waHello", { clinic: clinic.name }), clinic.phone)} target="_blank" rel="noopener" className="btn min-h-13 border-surface/40 bg-transparent px-6 text-surface hover:bg-surface/15">
              <ChatIcon /> {t("whatsapp")}
            </a>
          </div>

          <ol className="absolute bottom-32 right-5 hidden gap-2 lg:right-8 lg:flex" aria-hidden="true">
            {photos.map((src, n) => (
              <li key={src} className="h-1 w-12 overflow-hidden rounded-full bg-surface/30">
                {n === slide && <span key={slide} className="tick block h-full rounded-full bg-surface" style={{ animationDuration: `${SLIDE_MS}ms` }} />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <BookingBar initialSlots={initialSlots} serverNow={serverNow} />
    </>
  );
}

/** Pick a service and a time on the home page itself; one press lands on the details step. */
function BookingBar({ initialSlots, serverNow }: { initialSlots: Slot[]; serverNow: number }) {
  const { clinic, t, lang, href } = useClinic();
  const router = useRouter();
  const today = nowIST(useNow(serverNow)).date;
  const slots = useLive((d) => d.nextOpenSlots(10), [], initialSlots);
  const [serviceId, setServiceId] = useState(clinic.services[0].id);
  const [slotKey, setSlotKey] = useState<string | null>(null);
  const key = (s: Slot) => `${s.date}.${s.time}`;
  const chosen = slots.find((s) => key(s) === slotKey) ?? slots[0];

  function go(e: React.FormEvent) {
    e.preventDefault();
    router.push(href("/book", chosen ? { service: serviceId, slot: key(chosen) } : { service: serviceId }));
  }

  return (
    <div className="wrap relative z-10 -mt-28 lg:-mt-24">
      <form onSubmit={go} className="enter grid gap-4 rounded-[1.5rem] border border-line bg-surface p-5 shadow-float lg:grid-cols-[1.1fr_1.5fr_1.5fr_auto] lg:items-end lg:gap-5 lg:p-6" style={{ "--i": 10 } as React.CSSProperties}>
        <div aria-live="polite">
          <p className="flex items-center gap-2 text-[0.9rem] font-semibold text-teal">
            <span aria-hidden="true" className="size-2 animate-pulse-dot rounded-full bg-teal" /> {t("nextAvailable")}
          </p>
          {slots[0] ? (
            <p className="mt-0.5 leading-tight">
              <span className="text-[0.94rem] font-semibold">{fmtDay(slots[0].date, lang, today)}</span>
              <span className="wide-digits block font-[family-name:var(--font-display)] text-[2rem] font-extrabold tracking-tight text-accent">{fmtTime(slots[0].time, lang)}</span>
            </p>
          ) : (
            <p className="mt-1 text-[0.94rem]">{t("noSlots")}</p>
          )}
        </div>
        <div>
          <label htmlFor="hb-service" className="label">{t("stepService")}</label>
          <select id="hb-service" className="field" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {clinic.services.map((s) => (
              <option key={s.id} value={s.id}>{s.name[lang]} ({rupees(s.fee)})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hb-time" className="label">{t("stepTime")}</label>
          <select id="hb-time" className="field wide-digits" value={chosen ? key(chosen) : ""} disabled={slots.length === 0} onChange={(e) => setSlotKey(e.target.value)}>
            {slots.map((s) => (
              <option key={key(s)} value={key(s)}>{fmtDay(s.date, lang, today)}, {fmtTime(s.time, lang)}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary shine nudge min-h-[52px] px-7 text-[1.05rem]">
          {t("book")} <ArrowIcon />
        </button>
      </form>
      <p className="mt-3 hidden text-center text-[0.94rem] text-ink-soft lg:block">
        <Link href={href("/services")} className="font-semibold text-accent underline-offset-4 hover:underline">{t("allServices")}</Link>
      </p>
    </div>
  );
}
