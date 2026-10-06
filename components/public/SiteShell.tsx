"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPhone } from "@/lib/clinic";
import type { TKey } from "@/lib/i18n";
import { useClinic } from "../ClinicProvider";
import { CrossIcon, LogoMark, MenuIcon, PhoneIcon, PinIcon } from "../icons";
import { LangSwitch } from "../LangSwitch";
import { Motion } from "./Motion";
import { OpenStatus } from "./parts";

const NAV: [string, TKey][] = [
  ["/", "navHome"], ["/about", "navAbout"], ["/services", "navServices"], ["/doctor", "navDoctor"], ["/gallery", "navGallery"], ["/contact", "navContact"],
];
const FOOTER_NAV: [string, TKey][] = [...NAV.slice(1), ["/reviews", "navReviews"], ["/faq", "navFaq"], ["/book", "book"]];
const isActive = (path: string, to: string) => (to === "/" ? path === "/" : path === to || path.startsWith(to + "/"));

/** Header, navigation and footer shared by every public page. */
export function SiteShell({ serverNow, children }: { serverNow: number; children: React.ReactNode }) {
  const { clinic, t, href } = useClinic();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface pb-[4.75rem] lg:pb-0">
      <div className="bg-ink text-[0.88rem] text-surface">
        <div className="wrap flex items-center justify-between gap-3 py-1.5">
          <OpenStatus serverNow={serverNow} className="min-w-0" />
          <div className="shrink-0 lg:hidden"><LangSwitch /></div>
          <p className="hidden items-center gap-5 lg:flex">
            <span className="flex items-center gap-1.5"><PinIcon width={15} height={15} /> {clinic.area}, {clinic.city}</span>
            {clinic.phone && (
              <a href={`tel:+91${clinic.phone}`} className="wide-digits flex items-center gap-1.5 font-semibold">
                <PhoneIcon width={15} height={15} /> {formatPhone(clinic.phone)}
              </a>
            )}
          </p>
        </div>
      </div>

      <Motion />
      <header data-site className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="wrap flex items-center gap-3 py-2.5">
          <Link href={href("/")} className="flex min-h-11 min-w-0 items-center gap-2.5">
            <LogoMark />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-bold">{clinic.name}</span>
              <span className="block truncate text-[0.8rem] text-ink-soft">{clinic.area}, {clinic.city}</span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map(([to, key]) => (
              <Link
                key={to}
                href={href(to)}
                aria-current={isActive(path, to) ? "page" : undefined}
                className={`rounded-sm px-2.5 py-2 font-medium hover:text-accent ${isActive(path, to) ? "text-accent underline decoration-2 underline-offset-8" : ""}`}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
            <div className="hidden lg:block"><LangSwitch /></div>
            <Link href={href("/book")} className="btn btn-primary shine hidden lg:inline-flex">{t("book")}</Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={t("menu")}
              onClick={() => setOpen(!open)}
              className="btn px-3 lg:hidden"
            >
              {open ? <CrossIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main" className="border-t border-line lg:hidden">
            <ul className="wrap py-2">
              {NAV.map(([to, key]) => (
                <li key={to}>
                  <Link
                    href={href(to)}
                    aria-current={isActive(path, to) ? "page" : undefined}
                    className={`flex min-h-12 items-center border-b border-line font-semibold last:border-0 ${isActive(path, to) ? "text-accent" : ""}`}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-ink text-surface">
        <div className="wrap grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[5fr_3fr_4fr]">
          <div>
            <p className="flex items-center gap-2.5 text-lg font-bold"><LogoMark size={32} /> {clinic.name}</p>
            <p className="mt-3 text-[#c3cfde]">
              {clinic.doctor}, {clinic.qualification}
              <br />
              {clinic.area}, {clinic.city}
              {clinic.phone && (
                <>
                  <br />
                  <span className="wide-digits">{formatPhone(clinic.phone)}</span>
                </>
              )}
            </p>
          </div>
          <div>
            <h2 className="text-base">{t("quickLinks")}</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
              {FOOTER_NAV.map(([to, key]) => (
                <li key={to}>
                  <Link href={href(to)} className="inline-flex min-h-11 items-center text-[#c3cfde] underline-offset-4 hover:text-surface hover:underline">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-base">{t("timingsHeading")}</h2>
            <OpenStatus serverNow={serverNow} className="mt-3 text-[#c3cfde]" />
            <p className="mt-4 rounded-md border border-[#3b4d66] px-3 py-2 text-[0.92rem] text-[#c3cfde]">{t("emergency")}</p>
          </div>
        </div>
        <div className="border-t border-[#26374f]">
          <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-4 text-[0.88rem] text-[#a9b8cb]">
            <p>{t("demoFooter")}</p>
            <Link href={href("/desk")} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-surface">{t("staffDesk")}</Link>
          </div>
        </div>
      </footer>

      {/* On a phone the two things patients came for stay within reach of the thumb. */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-line bg-surface px-4 py-2.5 lg:hidden">
        <Link href={href("/book")} className="btn btn-primary min-h-13 flex-1 text-[1.05rem]">{t("book")}</Link>
        <a href={`tel:${clinic.phone ? "+91" + clinic.phone : ""}`} aria-label={t("call")} className="btn min-h-13 px-4">
          <PhoneIcon />
        </a>
      </div>
    </div>
  );
}
