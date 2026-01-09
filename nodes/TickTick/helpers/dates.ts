export function formatDateYYYYMMDD(dateStr: string): string {
	const date = new Date(dateStr);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}${month}${day}`;
}

export function formatDateStampYYYYMMDD(date: Date): number {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return Number.parseInt(`${year}${month}${day}`, 10);
}

export function formatISO8601WithMillis(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, ".000+0000");
}
