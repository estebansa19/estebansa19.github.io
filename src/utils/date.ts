/** Whole years elapsed since `date`, evaluated at build time. */
export function yearsSince(date: Date): number {
  const now = new Date();
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - date.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < date.getUTCDate())) {
    years--;
  }
  return years;
}

/** ISO `YYYY-MM-DD`, the format schema.org and <time datetime> expect. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Calendar months from `from`'s month to `to`'s, so "Dec 2018 — Apr 2021" is 28.
 * Minimum 1, so a role that started this month still shows.
 */
export function monthsBetween(from: Date, to: Date): number {
  const months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth();
  return Math.max(1, months);
}

/** Compact tenure, LinkedIn-style: `2y 3m`, `8m`, `1y`. */
export function formatSpan(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years}y`, rest && `${rest}m`].filter(Boolean).join(' ') || '0m';
}
