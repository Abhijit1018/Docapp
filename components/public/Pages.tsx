"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatPhone, rupees, serviceById } from "@/lib/clinic";
import type { TKey } from "@/lib/i18n";
import type { Slot } from "@/lib/data/types";
import { useClinic } from "../ClinicProvider";
import { ArrowIcon, BackIcon, CheckIcon, ClockIcon, CrossIcon, ForwardIcon, PinIcon, QuoteIcon, ReceiptIcon } from "../icons";
import {
  ContactActions, CtaBand, doctorInitials, Faq, OpenStatus, PageHead, Photo, Reviews, SectionHead, ServiceCard, SlotChips, Stats, TextLink, Timings,
} from "./parts";

const FACILITIES: TKey[] = ["fac1", "fac2", "fac3", "fac4"];
const WHY: [TKey, TKey][] = [["why1", "why1d"], ["why2", "why2d"], ["why3", "why3d"], ["why4", "why4d"]];

function Checklist({ keys }: { keys: TKey[] }) {
  const { t } = useClinic();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {keys.map((key) => (
        <li key={key} className="flex items-start gap-2.5 font-medium">
          <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal text-surface">
            <CheckIcon width={13} height={13} strokeWidth={3} />
          </span>
          {t(key)}
        </li>
      ))}
    </ul>
  );
}

export function AboutPage() {
  const { clinic, t, lang, href } = useClinic();
  const kind = lang === "en" ? clinic.kind.en.toLowerCase() : clinic.kind[lang];
  return (
    <>
      <PageHead title={t("aboutLead")} sub={t("aboutBody", { clinic: clinic.name, kind, area: clinic.area, city: clinic.city, doctor: clinic.doctor })} photo={clinic.photos[4]} />
      <div className="border-b border-line"><Stats className="wrap max-w-[52rem] py-8" /></div>

      <section className="wrap py-14 lg:py-20">
        <SectionHead title={t("whyHeading")} />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(([title, body], n) => (
            <li key={title} className="rise card lift p-6">
              <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-accent">0{n + 1}</p>
              <h3 className="mt-3 text-[1.1rem]">{t(title)}</h3>
              <p className="mt-1.5 text-ink-soft">{t(body)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="wrap grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div className="rise grid grid-cols-2 gap-4">
            <div className="zoom relative aspect-[3/4] rounded-2xl"><Photo src={clinic.photos[1]} sizes="(min-width: 1024px) 250px, 45vw" className="rounded-2xl" /></div>
            <div className="zoom relative mt-10 aspect-[3/4] rounded-2xl"><Photo src={clinic.photos[5]} sizes="(min-width: 1024px) 250px, 45vw" className="rounded-2xl" /></div>
          </div>
          <div className="rise">
            <h2 className="h-section">{t("facilitiesHeading")}</h2>
            <div className="mt-6"><Checklist keys={FACILITIES} /></div>
            <div className="mt-7 flex flex-wrap gap-x-7"><TextLink to={href("/gallery")}>{t("seeGallery")}</TextLink><TextLink to={href("/doctor")}>{t("navDoctor")}</TextLink></div>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export function DoctorPage() {
  const { clinic, t, lang, href } = useClinic();
  return (
    <>
      <PageHead title={clinic.doctor} sub={`${clinic.qualification}. ${t("years", { n: clinic.years })}.`} photo={clinic.photos[3]}>
        <Link href={href("/book")} className="btn shine nudge min-h-13 border-surface px-6 text-accent">{t("book")} <ArrowIcon /></Link>
      </PageHead>
      <section className="wrap grid gap-10 py-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16 lg:py-20">
        <div className="rise card self-start p-6 text-center shadow-card">
          <span aria-hidden="true" className="mx-auto grid size-28 place-items-center rounded-full bg-accent text-4xl font-bold text-surface">
            {doctorInitials(clinic)}
          </span>
          <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-extrabold">{clinic.doctor}</p>
          <p className="text-ink-soft">{clinic.kind[lang]}</p>
          <dl className="mt-5 border-t border-line pt-4 text-left">
            <dt className="text-[0.88rem] text-ink-soft">{t("qualHeading")}</dt>
            <dd className="font-semibold">{clinic.qualification}</dd>
            <dd className="mt-3 font-semibold">{t("years", { n: clinic.years })}</dd>
            <dd className="mt-3 font-semibold">{t("regNo", { n: clinic.regNo })}</dd>
          </dl>
        </div>
        <div className="rise">
          <QuoteIcon className="text-accent" width={44} height={44} />
          <blockquote className="mt-2 text-[1.35rem] font-medium leading-relaxed lg:text-[1.6rem]">{clinic.quote[lang]}</blockquote>
          <h2 className="mt-12 text-2xl">{t("servicesHeading")}</h2>
          <ul className="mt-4">
            {clinic.services.map((s) => (
              <li key={s.id} className="border-b border-line">
                <Link href={href(`/services/${s.id}`)} className="nudge flex min-h-14 items-center justify-between gap-4 py-2 hover:text-accent">
                  <span className="font-medium">{s.name[lang]}</span>
                  <span className="wide-digits flex shrink-0 items-center gap-3 font-bold">{rupees(s.fee)} <ArrowIcon width={18} height={18} className="text-accent" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export function ServicesPage() {
  const { clinic, t } = useClinic();
  return (
    <>
      <PageHead title={t("servicesHeading")} sub={`${t("servicesIntro")} ${t("payNote")}`} photo={clinic.photos[0]} />
      <section className="wrap py-14 lg:py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clinic.services.map((s, n) => (
            <li key={s.id} className="rise"><ServiceCard service={s} index={n} /></li>
          ))}
        </ul>
      </section>
      <section className="border-t border-line bg-paper">
        <div className="wrap max-w-[52rem] py-14">
          <h2 className="h-section">{t("faqHeading")}</h2>
          <div className="mt-6"><Faq /></div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export function ServiceDetailPage({ id, initialSlots, serverNow }: { id: string; initialSlots: Slot[]; serverNow: number }) {
  const { clinic, t, lang, href } = useClinic();
  const service = serviceById(clinic, id);
  const index = clinic.services.indexOf(service);
  const others = clinic.services.filter((s) => s.id !== service.id).slice(0, 3);
  return (
    <>
      <PageHead title={service.name[lang]} sub={service.about[lang]} photo={clinic.photos[index % 4]}>
        <Link href={href("/services")} className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#9fd0ff] underline-offset-4 hover:underline"><BackIcon width={18} height={18} /> {t("servicesHeading")}</Link>
      </PageHead>
      <section className="wrap grid gap-10 py-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-20">
        <div className="rise">
          <h2 className="h-section">{t("expectHeading")}</h2>
          <ol className="mt-7 grid gap-6">
            {(["exp1", "exp2", "exp3"] as TKey[]).map((key, n) => (
              <li key={key} className="flex gap-4">
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent font-[family-name:var(--font-display)] text-lg font-extrabold text-surface">{n + 1}</span>
                <p className="pt-1.5 text-lg">{t(key)}</p>
              </li>
            ))}
          </ol>
          <h2 className="mt-12 text-2xl">{t("faqBringQ")}</h2>
          <p className="mt-2 text-lg text-ink-soft">{clinic.bring[lang]}</p>
        </div>
        <aside className="rise card self-start p-6 shadow-card lg:sticky lg:top-24">
          <p className="text-ink-soft">{t("fee")}</p>
          <p className="wide-digits font-[family-name:var(--font-display)] text-[2.6rem] font-extrabold leading-tight text-accent">{rupees(service.fee)}</p>
          <ul className="mt-3 grid gap-2 border-y border-line py-4 font-medium">
            <li className="flex items-center gap-2.5"><ClockIcon className="text-teal" /> {t("visitLength", { n: clinic.slotMinutes })}</li>
            <li className="flex items-center gap-2.5"><ReceiptIcon className="text-teal" /> {t("payNote")}</li>
          </ul>
          <Link href={href("/book", { service: service.id })} className="btn btn-primary nudge mt-5 min-h-14 w-full text-[1.05rem]">{t("bookThis")} <ArrowIcon /></Link>
          <p className="mb-2 mt-5 text-[0.94rem] font-medium text-ink-soft">{t("nextAvailable")}</p>
          <SlotChips initialSlots={initialSlots} serverNow={serverNow} serviceId={service.id} />
        </aside>
      </section>
      <section className="border-t border-line bg-paper">
        <div className="wrap py-14 lg:py-20">
          <SectionHead title={t("otherServices")} action={<TextLink to={href("/services")}>{t("allServices")}</TextLink>} />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.id} className="rise"><ServiceCard service={s} index={clinic.services.indexOf(s)} /></li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

// Tall and wide tiles alternate so the grid reads as a wall of photos, not a table.
const SPANS = ["row-span-2", "", "", "row-span-2", "", "row-span-2", "", ""];

export function GalleryPage() {
  const { clinic, t } = useClinic();
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = clinic.photos;
  const show = (n: number) => {
    setOpen(n);
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  const step = (by: number) => setOpen((n) => (n === null ? n : (n + by + photos.length) % photos.length));

  return (
    <>
      <PageHead title={t("galleryTitle")} sub={t("gallerySub")} />
      <section className="wrap py-12 lg:py-16">
        <ul className="grid auto-rows-[9.5rem] grid-cols-2 gap-3 lg:auto-rows-[13rem] lg:grid-cols-4 lg:gap-4">
          {photos.map((src, n) => (
            <li key={src} className={`rise ${SPANS[n % SPANS.length]}`}>
              <button type="button" onClick={() => show(n)} aria-label={`${t("galleryTitle")} ${n + 1}`} className="zoom relative block size-full rounded-2xl">
                <Photo src={src} sizes="(min-width: 1024px) 270px, 46vw" className="rounded-2xl" />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onKeyDown={(e) => (e.key === "ArrowRight" ? step(1) : e.key === "ArrowLeft" ? step(-1) : undefined)}
        aria-label={t("galleryTitle")}
        className="m-auto w-[min(64rem,calc(100vw-1.5rem))] rounded-2xl bg-ink p-0 text-surface"
      >
        {open !== null && (
          <div>
            <div className="relative aspect-[3/2]"><Photo src={photos[open]} sizes="(min-width: 1024px) 1024px, 100vw" className="object-contain" /></div>
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="wide-digits pl-2 text-[#c3cfde]">{open + 1} / {photos.length}</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => step(-1)} aria-label="Previous" className="btn px-3"><BackIcon /></button>
                <button type="button" onClick={() => step(1)} aria-label="Next" className="btn px-3"><ForwardIcon /></button>
                <button type="button" onClick={() => dialog.current?.close()} className="btn px-3"><CrossIcon /> {t("close")}</button>
              </span>
            </div>
          </div>
        )}
      </dialog>
      <CtaBand />
    </>
  );
}

export function ReviewsPage() {
  const { clinic, t } = useClinic();
  return (
    <>
      <PageHead title={t("reviewsHeading")} sub={t("reviewsSub")} photo={clinic.photos[6]} />
      <div className="border-b border-line"><Stats className="wrap max-w-[52rem] py-8" /></div>
      <section className="wrap py-14 lg:py-20"><Reviews count={6} /></section>
      <CtaBand />
    </>
  );
}

export function FaqPage({ serverNow }: { serverNow: number }) {
  const { clinic, t } = useClinic();
  return (
    <>
      <PageHead title={t("faqHeading")} sub={t("contactSub")} photo={clinic.photos[7]} />
      <section className="wrap grid gap-10 py-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14 lg:py-20">
        <div className="rise"><Faq /></div>
        <aside className="rise card self-start p-6">
          <h2 className="text-xl">{t("navContact")}</h2>
          <OpenStatus serverNow={serverNow} className="mt-3 font-medium" />
          <ContactActions className="mt-4" />
        </aside>
      </section>
      <CtaBand />
    </>
  );
}

export function ContactPage({ serverNow }: { serverNow: number }) {
  const { clinic, t } = useClinic();
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${clinic.name}, ${clinic.area}, ${clinic.city}`);
  return (
    <>
      <PageHead title={t("contactTitle")} sub={t("contactSub")} photo={clinic.photos[5]} />
      <section className="wrap grid gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="rise">
          <h2 className="h-section">{t("locationHeading")}</h2>
          <address className="mt-4 text-lg not-italic">
            {clinic.name}
            <br />
            {clinic.area}, {clinic.city}
            {clinic.phone && (
              <>
                <br />
                <a href={`tel:+91${clinic.phone}`} className="wide-digits font-semibold text-accent">{formatPhone(clinic.phone)}</a>
              </>
            )}
          </address>
          <OpenStatus serverNow={serverNow} className="mt-3 font-medium" />
          <ContactActions className="mt-6 max-w-[26rem]" />
          <a href={mapUrl} target="_blank" rel="noopener" className="btn mt-3 w-full max-w-[26rem]"><PinIcon /> {t("openMaps")}</a>
          <p className="mt-6 max-w-[26rem] rounded-md border border-missed bg-missed-wash px-4 py-3 font-medium">{t("emergency")}</p>
        </div>
        <div className="rise">
          <h2 className="h-section">{t("timingsHeading")}</h2>
          <div className="card mt-6 p-2 shadow-card"><Timings serverNow={serverNow} /></div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
