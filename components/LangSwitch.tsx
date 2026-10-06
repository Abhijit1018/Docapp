"use client";

import { LANGS } from "@/lib/i18n";
import { useClinic } from "./ClinicProvider";

export function LangSwitch() {
  const { lang, setLang, t } = useClinic();
  return (
    <div role="group" aria-label={t("language")} className="flex rounded-md border-[1.5px] border-line-strong bg-surface p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          // The other scripts' labels use the device font, so an English page
          // does not download two more font files for two letters.
          className={`min-h-11 min-w-11 rounded-sm px-2 text-[0.95rem] font-semibold leading-none ${l.id !== lang && l.id !== "en" ? "font-[system-ui,sans-serif]" : ""} ${
            lang === l.id ? "bg-accent text-surface" : "text-ink hover:bg-paper"
          }`}
        >
          {l.label}
          <span className="sr-only"> {l.name}</span>
        </button>
      ))}
    </div>
  );
}
