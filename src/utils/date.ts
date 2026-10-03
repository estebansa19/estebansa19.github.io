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

const MS_PER_MONTH = (365.25 / 12) * 24 * 60 * 60 * 1000;

/** Months between two dates, rounded to the nearest whole month (minimum 1). */
export function monthsBetween(from: Date, to: Date): number {
	return Math.max(1, Math.round((to.getTime() - from.getTime()) / MS_PER_MONTH));
}

/** Compact tenure, LinkedIn-style: `2y 3m`, `8m`, `1y`. */
export function formatSpan(months: number): string {
	const years = Math.floor(months / 12);
	const rest = months % 12;
	return [years && `${years}y`, rest && `${rest}m`].filter(Boolean).join(' ') || '0m';
}
