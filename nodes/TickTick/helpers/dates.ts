import { DateTime } from "luxon";

export function formatDateYYYYMMDD(dateStr: string): string {
	const dt = DateTime.fromISO(dateStr, { setZone: true });
	return dt.toFormat("yyyyMMdd");
}

export function formatDateStampYYYYMMDD(dateStr: string): number {
	return Number.parseInt(formatDateYYYYMMDD(dateStr), 10);
}

export function formatISO8601WithMillis(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, ".000+0000");
}
