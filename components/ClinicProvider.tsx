"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type DependencyList } from "react";
import { buildClinic, toQuery, type Clinic, type ClinicParams, type Lang } from "@/lib/clinic";
import { LANG_COOKIE, translate, type TKey } from "@/lib/i18n";
import { createLocalData } from "@/lib/data/local";
import type { ClinicData } from "@/lib/data/types";

interface Ctx {
  clinic: Clinic;
  params: ClinicParams;
  data: ClinicData;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Internal link that keeps the pitch's clinic in the URL. */
  href: (path: string, extra?: Record<string, string>) => string;
}

const ClinicContext = createContext<Ctx | null>(null);
const PARAMS_KEY = "clinicdesk:params";

export function ClinicProvider({ params: urlParams, lang: initialLang, children }: {
  params: ClinicParams;
  lang: Lang;
  children: React.ReactNode;
}) {
  const [remembered, setRemembered] = useState<ClinicParams | null>(null);
  const [lang, setLangState] = useState(initialLang);
  const hasUrlParams = Object.keys(urlParams).length > 0;

  // A URL without clinic params falls back to the last pitch opened on this
  // device, so a bare /desk still shows the prospect's clinic.
  useEffect(() => {
    try {
      if (hasUrlParams) localStorage.setItem(PARAMS_KEY, JSON.stringify(urlParams));
      else {
        const saved = localStorage.getItem(PARAMS_KEY);
        if (saved) setRemembered(JSON.parse(saved));
      }
    } catch {}
  }, [hasUrlParams, urlParams]);

  const params = hasUrlParams ? urlParams : (remembered ?? urlParams);
  const paramsKey = JSON.stringify(params);
  const value = useMemo<Ctx>(() => {
    const p: ClinicParams = JSON.parse(paramsKey);
    const clinic = buildClinic(p);
    const qs = toQuery(p);
    return {
      clinic,
      params: p,
      data: createLocalData(clinic),
      lang,
      setLang: (l) => {
        document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = l;
        setLangState(l);
      },
      t: (key, vars) => translate(lang, key, vars),
      href: (path, extra) => {
        const q = new URLSearchParams(qs);
        for (const k in extra) q.set(k, extra[k]);
        const str = q.toString();
        return str ? `${path}?${str}` : path;
      },
    };
  }, [paramsKey, lang]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): Ctx {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}

/**
 * Reads from the data layer and re-reads whenever anything changes, in this
 * tab or another one. Also re-reads every half minute, because time passing
 * closes slots and makes reminders due.
 */
export function useLive<T>(fn: (data: ClinicData) => Promise<T>, deps: DependencyList, initial: T): T;
export function useLive<T>(fn: (data: ClinicData) => Promise<T>, deps: DependencyList): T | undefined;
export function useLive<T>(fn: (data: ClinicData) => Promise<T>, deps: DependencyList, initial?: T): T | undefined {
  const { data } = useClinic();
  const [value, setValue] = useState<T | undefined>(initial);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    let alive = true;
    const run = () => {
      fnRef.current(data).then((v) => alive && setValue(v), () => {});
    };
    run();
    const off = data.subscribe(run);
    const timer = setInterval(run, 30000);
    return () => {
      alive = false;
      off();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ...deps]);
  return value;
}

/** The current time, ticking every half minute. Starts from the server's clock so the first render matches. */
export function useNow(initial: number): number {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function useStableCallback<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: A) => ref.current(...args), []);
}
