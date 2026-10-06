// All clinic dates and times are in India Standard Time, whatever the viewer's
// device or the server is set to. A date is "YYYY-MM-DD"; a time of day is
// minutes since midnight.

export type DateStr = string;

const IST_OFFSET_MIN = 330;

export function nowIST(ms: number = Date.now()): { date: DateStr; minutes: number } {
  const d = new Date(ms + IST_OFFSET_MIN * 60000);
  return { date: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

export function toEpoch(date: DateStr, minutes: number): number {
  return Date.parse(date + "T00:00:00Z") + (minutes - IST_OFFSET_MIN) * 60000;
}

export function addDays(date: DateStr, n: number): DateStr {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diffDays(a: DateStr, b: DateStr): number {
  return Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / 86400000);
}

/** 0 = Sunday. */
export function weekday(date: DateStr): number {
  return new Date(date + "T00:00:00Z").getUTCDay();
}

/** The Monday on or before the given date. */
export function startOfWeek(date: DateStr): DateStr {
  return addDays(date, -((weekday(date) + 6) % 7));
}
