import { rupees, serviceById, type Clinic, type Lang } from "./clinic";
import { fmtDay, fmtTimeAt } from "./i18n";
import { nowIST, toEpoch } from "./time";
import type { AppointmentView, ReminderKind } from "./data/types";

const TEMPLATES: Record<ReminderKind, Record<Lang, string>> = {
  confirm: {
    en: "Hello {name}, your visit at {clinic} is booked for {day}, {time} with {doctor} ({service}, {fee}). To change the time, reply here.",
    hi: "नमस्ते {name}, {clinic} में आपकी अपॉइंटमेंट {day}, {time} {doctor} के साथ बुक हो गई है ({service}, {fee})। समय बदलना हो तो यहीं जवाब दें।",
    gu: "નમસ્તે {name}, {clinic}માં તમારી એપોઇન્ટમેન્ટ {day}, {time} {doctor} સાથે બુક થઈ ગઈ છે ({service}, {fee}). સમય બદલવો હોય તો અહીં જ જવાબ આપો.",
  },
  evening: {
    en: "Hello {name}, a reminder of your visit at {clinic} tomorrow at {time} with {doctor}. If you need to change the time, reply here.",
    hi: "नमस्ते {name}, याद दिला दें: कल {time} {clinic} में {doctor} के साथ आपकी अपॉइंटमेंट है। समय बदलना हो तो यहीं जवाब दें।",
    gu: "નમસ્તે {name}, યાદ અપાવીએ છીએ: આવતીકાલે {time} {clinic}માં {doctor} સાથે તમારી એપોઇન્ટમેન્ટ છે. સમય બદલવો હોય તો અહીં જ જવાબ આપો.",
  },
  twohour: {
    en: "Hello {name}, your visit at {clinic} is today at {time}, in about two hours. We are in {area}. See you soon.",
    hi: "नमस्ते {name}, आज {time} {clinic} में आपकी अपॉइंटमेंट है, क़रीब दो घंटे बाद। पता: {area}। मिलते हैं।",
    gu: "નમસ્તે {name}, આજે {time} {clinic}માં તમારી એપોઇન્ટમેન્ટ છે, લગભગ બે કલાક પછી. સરનામું: {area}. મળીએ.",
  },
};

export function messageText(kind: ReminderKind, a: AppointmentView, clinic: Clinic, lang: Lang = a.patient.lang): string {
  const vars: Record<string, string> = {
    name: a.patient.name,
    clinic: clinic.name,
    doctor: clinic.doctor,
    // Mid-sentence in English, so "today", not "Today".
    day: fmtDay(a.date, lang, nowIST().date).replace(/^T(?=oday|omorrow)/, "t"),
    time: fmtTimeAt(a.time, lang),
    service: serviceById(clinic, a.serviceId).name[lang],
    fee: rupees(a.fee),
    area: `${clinic.area}, ${clinic.city}`,
  };
  return TEMPLATES[kind][lang].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

/**
 * Opens the device's own WhatsApp with the text filled in. Seeded patients
 * have made-up numbers, so for them WhatsApp asks which contact to send to
 * instead of messaging a stranger.
 */
export function whatsappLink(text: string, phone: string | null): string {
  const q = "?text=" + encodeURIComponent(text);
  return phone ? `https://wa.me/91${phone}${q}` : `https://wa.me/${q}`;
}

function icsStamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function calendarFile(a: AppointmentView, clinic: Clinic, lang: Lang): string {
  const start = toEpoch(a.date, a.time);
  const esc = (v: string) => v.replace(/([,;\\])/g, "\\$1");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClinicDesk//Demo//EN",
    "BEGIN:VEVENT",
    `UID:${a.id}@clinicdesk.demo`,
    `DTSTAMP:${icsStamp(Date.now())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(start + clinic.slotMinutes * 60000)}`,
    `SUMMARY:${esc(`${clinic.doctor}, ${clinic.name}`)}`,
    `DESCRIPTION:${esc(`${serviceById(clinic, a.serviceId).name[lang]}, ${rupees(a.fee)}`)}`,
    `LOCATION:${esc(`${clinic.name}, ${clinic.area}, ${clinic.city}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Clinic visit",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
