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
