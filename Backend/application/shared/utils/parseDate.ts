export const DATE_RE = /^\d{2}-\d{2}-\d{4}$/;

function parseDDMMYYYY(s: string): Date | null {
  const [ddStr, mmStr, yyyyStr] = s.split("-");
  const dd = Number(ddStr);
  const mm = Number(mmStr);
  const yyyy = Number(yyyyStr);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
  // validate roll-over
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

export function isAllowedBookingDate(slotDate: string): boolean {
  const d = parseDDMMYYYY(slotDate);
  if (!d) return false;
  const today = startOfTodayLocal();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date(today);
  day3.setDate(day3.getDate() + 3);
  return (
    d.getTime() === tomorrow.getTime() ||
    d.getTime() === day2.getTime() ||
    d.getTime() === day3.getTime()
  );
}

export function isValidIsoDateTime(s: string): boolean {
    const d = new Date(s);
    return !Number.isNaN(d.getTime()) && d.toISOString() === s;
  }
  
  export function toLocalDateKeyDDMMYYYY(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }