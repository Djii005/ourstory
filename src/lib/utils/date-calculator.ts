export interface TimeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export interface CountdownInfo {
  targetDate: Date;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
}

export function calculateTimeTogether(startDateStr: string, now: Date = new Date()): TimeBreakdown {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
  }

  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalDays,
  };
}

export function getNextAnniversary(startDateStr: string, now: Date = new Date()): CountdownInfo {
  const start = new Date(startDateStr);
  const currentYear = now.getFullYear();
  let nextAnniversary = new Date(currentYear, start.getMonth(), start.getDate(), 0, 0, 0);

  if (nextAnniversary.getTime() <= now.getTime()) {
    nextAnniversary = new Date(currentYear + 1, start.getMonth(), start.getDate(), 0, 0, 0);
  }

  const diffMs = Math.max(0, nextAnniversary.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const yearsCount = nextAnniversary.getFullYear() - start.getFullYear();

  return {
    targetDate: nextAnniversary,
    days,
    hours,
    minutes,
    seconds,
    label: `${yearsCount} Year${yearsCount > 1 ? "s" : ""} Anniversary`,
  };
}

export function getNextMonthsary(startDateStr: string, now: Date = new Date()): CountdownInfo {
  const start = new Date(startDateStr);
  const targetDay = start.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const clampedDay = Math.min(targetDay, daysInCurrentMonth);

  let nextMonthsary = new Date(currentYear, currentMonth, clampedDay, 0, 0, 0);

  if (nextMonthsary.getTime() <= now.getTime()) {
    const nextMonth = currentMonth + 1;
    const daysInNextMonth = new Date(currentYear, nextMonth + 1, 0).getDate();
    nextMonthsary = new Date(currentYear, nextMonth, Math.min(targetDay, daysInNextMonth), 0, 0, 0);
  }

  const diffMs = Math.max(0, nextMonthsary.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    targetDate: nextMonthsary,
    days,
    hours,
    minutes,
    seconds,
    label: "Next Monthsary",
  };
}
