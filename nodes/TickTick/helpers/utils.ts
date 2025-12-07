import { DateTime } from "luxon";

export function formatTickTickDate(dateString: string): string | undefined {
	if (!dateString) return undefined;

	const date = DateTime.fromISO(dateString);
	const datePart = date.toFormat("yyyy-MM-dd'T'HH:mm:ss");

	const offsetSign = date.offset >= 0 ? "+" : "-";
	const offsetHours = String(Math.floor(Math.abs(date.offset) / 60)).padStart(
		2,
		"0",
	);
	const offsetMinutes = String(Math.abs(date.offset) % 60).padStart(2, "0");

	return `${datePart}${offsetSign}${offsetHours}${offsetMinutes}`;
}
