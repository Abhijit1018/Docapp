"use client";

import { fmtDay, fmtDayInline, fmtTime } from "@/lib/i18n";
import { whatsappLink } from "@/lib/messages";
import { nowIST } from "@/lib/time";
import type { Reminder, ReminderKind } from "@/lib/data/types";
import { useClinic, useLive } from "../ClinicProvider";
import { ChatIcon } from "../icons";

const KIND_LABEL: Record<ReminderKind, string> = {
  confirm: "Booking confirmation",
  evening: "Reminder, evening before",
  twohour: "Reminder, two hours before",
};

function clockOf(ms: number, today: string): string {
  const at = nowIST(ms);
  return `${at.date === today ? "" : fmtDay(at.date, "en", today) + ", "}${fmtTime(at.minutes)}`;
}

export function Reminders({ today, now }: { today: string; now: number }) {
  const reminders = useLive((d) => d.listReminders(), []) ?? [];
  const due = reminders.filter((r) => !r.openedAt && r.dueAt <= now);
  const later = reminders.filter((r) => !r.openedAt && r.dueAt > now);
  const opened = reminders.filter((r) => r.openedAt);

  return (
    <div className="max-w-[46rem]">
      <h1 className="text-2xl">WhatsApp reminders</h1>
      <p className="mt-1 text-ink-soft">
        Each message opens in WhatsApp on this device with the text filled in. You press send there.
      </p>

      <Group title={`Due now (${due.length})`} empty="Nothing is due. New online bookings and upcoming reminders appear here." items={due} today={today} now={now} />
      {later.length > 0 && <Group title="Coming up in the next day" items={later} today={today} now={now} />}
      {opened.length > 0 && <Group title="Opened in WhatsApp" items={opened} today={today} now={now} />}
    </div>
  );
}

function Group({ title, items, empty, today, now }: { title: string; items: Reminder[]; empty?: string; today: string; now: number }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg">{title}</h2>
      {items.length === 0 && empty && <p className="mt-2 text-ink-soft">{empty}</p>}
      <ul className="mt-2 grid gap-3">
        {items.map((r) => <Item key={r.id} r={r} today={today} now={now} />)}
      </ul>
    </section>
  );
}

function Item({ r, today, now }: { r: Reminder; today: string; now: number }) {
  const { data } = useClinic();
  const { patient } = r.appointment;
  const isDue = r.dueAt <= now;
  return (
    <li className="rounded-md border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="font-semibold">
          {patient.name}
          <span className="font-normal text-ink-soft">, {fmtDayInline(r.appointment.date, today)} at {fmtTime(r.appointment.time)}</span>
        </p>
        <p className="text-[0.85rem] text-ink-soft">
          {KIND_LABEL[r.kind]}. {r.openedAt ? `Opened ${clockOf(r.openedAt, today)}` : isDue ? `Due since ${clockOf(r.dueAt, today)}` : `Due ${clockOf(r.dueAt, today)}`}
        </p>
      </div>
      <p lang={patient.lang} className="mt-2 max-w-[34rem] whitespace-pre-line rounded-lg rounded-tl-sm bg-paper px-3.5 py-2.5 leading-relaxed">
        {r.text}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={whatsappLink(r.text, patient.fictional ? null : patient.phone)}
          target="_blank"
          rel="noopener"
          onClick={() => data.markReminderOpened(r.id)}
          className={`btn btn-sm ${isDue && !r.openedAt ? "btn-primary" : ""}`}
        >
          <ChatIcon width={16} height={16} /> {r.openedAt ? "Open again" : "Open in WhatsApp"}
        </a>
        {patient.fictional && (
          <span className="text-[0.85rem] text-ink-soft">Fictional patient: WhatsApp will ask you to choose a contact.</span>
        )}
      </div>
    </li>
  );
}
