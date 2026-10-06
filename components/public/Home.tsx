"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { TKey } from "@/lib/i18n";
import type { Slot } from "@/lib/data/types";
import { useClinic } from "../ClinicProvider";
import { ArrowIcon, BellIcon, CheckIcon, ClockIcon, PinIcon, QuoteIcon, ReceiptIcon, ShieldIcon } from "../icons";
import { Hero } from "./Hero";
import { Compare, Conditions, Languages, MapBlock, PhotoStrip, WeekBoard, WhatsAppPreview } from "./HomeSections";
import { CtaBand, doctorInitials, Faq, Photo, Reviews, SectionHead, ServiceCard, Stats, TextLink, Timings } from "./parts";

const WHY: [TKey, TKey, typeof ClockIcon][] = [
  ["why1", "why1d", ClockIcon],
  ["why2", "why2d", ReceiptIcon],
  ["why3", "why3d", ShieldIcon],
  ["why4", "why4d", BellIcon],
];
const HOW: [TKey, TKey][] = [["how1", "how1d"], ["how2", "how2d"], ["how3", "how3d"]];
const FACILITIES: TKey[] = ["fac1", "fac2", "fac3", "fac4"];

export function Home({ initialSlots, serverNow }: { initialSlots: Slot[]; serverNow: number }) {
  const { clinic, t, lang, href } = useClinic();
  const kind = lang === "en" ? clinic.kind.en.toLowerCase() : clinic.kind[lang];
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${clinic.name}, ${clinic.area}, ${clinic.city}`);
  const names = clinic.services.map((s) => s.name[lang]);

  return (
    <>
      <Hero initialSlots={initialSlots} serverNow={serverNow} />
      <div className="border-b border-line"><Stats className="wrap max-w-[52rem] py-9 lg:py-11" /></div>

      {/* What the clinic treats, as a moving strip */}
      <div className="overflow-hidden bg-ink py-4 text-surface" aria-hidden="true">
        <div className="flex w-max animate-slide gap-10 whitespace-nowrap text-lg font-semibold motion-reduce:animate-none">
          {[...names, ...names, ...names, ...names].map((name, n) => (
            <span key={n} className="flex items-center gap-10">
              {name}
              <span className="size-2 rounded-full bg-[#5aa7f5]" />
            </span>
          ))}
        </div>
      </div>

      <WeekBoard serverNow={serverNow} />

      {/* Services */}
      <section className="wrap py-14 lg:py-20" aria-labelledby="services">
        <SectionHead id="services" title={t("servicesHeading")} sub={t("servicesIntro")} action={<TextLink to={href("/services")}>{t("allServices")}</TextLink>} />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clinic.services.map((s, n) => (
            <li key={s.id} className="rise"><ServiceCard service={s} index={n + 1} /></li>
          ))}
          <li className="rise">
            <Link href={href("/book")} className="lift flex h-full min-h-[16rem] flex-col justify-between rounded-lg bg-accent p-6 text-surface">
              <span className="font-[family-name:var(--font-display)] text-[1.6rem] font-extrabold leading-tight">{t("ctaTitle")}</span>
              <span className="nudge flex items-center gap-2 text-lg font-semibold">{t("book")} <ArrowIcon /></span>
            </Link>
          </li>
        </ul>
      </section>

      <Conditions />

      {/* About */}
      <section className="border-y border-line bg-paper">
        <div className="wrap grid gap-12 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div className="rise relative pb-10 pr-10">
            <div className="zoom relative aspect-[4/3] rounded-[1.75rem] shadow-card">
              <Photo src={clinic.photos[4]} sizes="(min-width: 1024px) 480px, 85vw" className="rounded-[1.75rem]" />
            </div>
            <div className="absolute bottom-0 right-0 w-[46%]">
              <div data-parallax="46" className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-paper shadow-float"><Photo src={clinic.photos[2]} sizes="240px" /></div>
            </div>
            <div className="absolute -left-2 top-6 rounded-xl bg-accent px-4 py-3 text-surface shadow-float lg:-left-5">
              <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none">{clinic.years}+</p>
              <p className="mt-1 text-[0.85rem]">{t("statYears")}</p>
            </div>
          </div>
          <div className="rise">
            <h2 className="h-section">{t("aboutLead")}</h2>
            <p className="mt-4 text-lg text-ink-soft">
              {t("aboutBody", { clinic: clinic.name, kind, area: clinic.area, city: clinic.city, doctor: clinic.doctor })}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {FACILITIES.map((key) => (
                <li key={key} className="flex items-start gap-2.5 font-medium">
                  <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal text-surface">
                    <CheckIcon width={13} height={13} strokeWidth={3} />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-7"><TextLink to={href("/about")}>{t("aboutTitle")}</TextLink><TextLink to={href("/gallery")}>{t("seeGallery")}</TextLink></div>
          </div>
        </div>
      </section>

      {/* Why, over a film of the clinic at work */}
      <section className="wrap py-14 lg:py-20" aria-labelledby="why">
        <div className="rise relative isolate overflow-hidden rounded-[1.75rem] bg-ink px-6 py-12 text-surface lg:px-14 lg:py-16">
          <AmbientVideo />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(14_34_56/0.94)_30%,rgb(14_34_56/0.6))]" />
          <h2 id="why" className="h-section max-w-[28rem]">{t("whyHeading")}</h2>
          <ul className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:max-w-[46rem]">
            {WHY.map(([title, body, Icon]) => (
              <li key={title} className="flex gap-4">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface/12 text-[#8cc4ff]"><Icon width={24} height={24} /></span>
                <div>
                  <h3 className="text-[1.1rem]">{t(title)}</h3>
                  <p className="mt-1 text-[#c3cfde]">{t(body)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Compare />

      {/* How booking works */}
      <section className="border-y border-line bg-paper" aria-labelledby="how">
        <div className="wrap py-14 lg:py-20">
          <SectionHead id="how" title={t("howHeading")} sub={t("ctaSub")} />
          <ol className="relative mt-10 grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-line-strong lg:block" />
            {HOW.map(([title, body], n) => (
              <li key={title} className="rise card relative p-6">
                <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-accent font-[family-name:var(--font-display)] text-2xl font-extrabold text-surface shadow-card">{n + 1}</span>
                <h3 className="mt-5 text-[1.2rem]">{t(title)}</h3>
                <p className="mt-1.5 text-ink-soft">{t(body)}</p>
              </li>
            ))}
          </ol>
          <div className="rise mt-9"><Link href={href("/book")} className="btn btn-primary shine nudge min-h-14 px-7 text-[1.05rem]">{t("book")} <ArrowIcon /></Link></div>
        </div>
      </section>

      <WhatsAppPreview serverNow={serverNow} />

      {/* The doctor */}
      <section className="wrap grid gap-10 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 lg:py-20" aria-labelledby="doctor">
        <div className="rise zoom relative aspect-[4/3.4] rounded-[1.75rem] shadow-card">
          <Photo src={clinic.photos[3]} sizes="(min-width: 1024px) 460px, 92vw" className="rounded-[1.75rem]" />
        </div>
        <div className="rise">
          <h2 id="doctor" className="h-section">{t("doctorHeading")}</h2>
          <QuoteIcon className="mt-6 text-accent" width={40} height={40} />
          <blockquote className="mt-2 text-[1.3rem] font-medium leading-relaxed lg:text-[1.5rem]">{clinic.quote[lang]}</blockquote>
          <div className="mt-7 flex items-center gap-4">
            <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-accent text-xl font-bold text-surface">{doctorInitials(clinic)}</span>
            <div>
              <p className="text-lg font-bold leading-snug">{clinic.doctor}</p>
              <p className="text-ink-soft">{clinic.qualification}</p>
              <p className="text-[0.9rem] text-ink-soft">{t("regNo", { n: clinic.regNo })}</p>
            </div>
          </div>
          <div className="mt-5"><TextLink to={href("/doctor")}>{t("navDoctor")}</TextLink></div>
        </div>
      </section>

      <PhotoStrip />

      {/* Reviews */}
      <section className="border-y border-line bg-paper" aria-labelledby="reviews">
        <div className="wrap py-14 lg:py-20">
          <SectionHead id="reviews" title={t("reviewsHeading")} sub={t("reviewsSub")} action={<TextLink to={href("/reviews")}>{t("allReviews")}</TextLink>} />
          <div className="mt-8"><Reviews count={3} /></div>
        </div>
      </section>

      <Languages />

      {/* Timings and questions */}
      <section className="wrap grid gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="rise" aria-labelledby="timings">
          <h2 id="timings" className="h-section">{t("timingsHeading")}</h2>
          <div className="card mt-6 p-2"><Timings serverNow={serverNow} /></div>
          <p className="mt-5 font-medium">{clinic.name}, {clinic.area}, {clinic.city}</p>
          <a href={mapUrl} target="_blank" rel="noopener" className="btn mt-3"><PinIcon /> {t("openMaps")}</a>
        </div>
        <div className="rise" aria-labelledby="faq">
          <h2 id="faq" className="h-section">{t("faqHeading")}</h2>
          <div className="mt-6"><Faq /></div>
          <div className="mt-4"><TextLink to={href("/faq")}>{t("navFaq")}</TextLink></div>
        </div>
      </section>

      <MapBlock />
      <CtaBand />
    </>
  );
}

/** A silent loop behind the "why" panel. It only downloads once the panel is near the screen. */
function AmbientVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!el.src) el.src = "/media/clinic-loop.mp4";
        el.play().catch(() => {});
      } else el.pause();
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref} muted loop playsInline preload="none" poster="/media/clinic-loop.jpg" aria-hidden="true" tabIndex={-1}
      className="absolute inset-0 -z-20 size-full object-cover"
    />
  );
}
