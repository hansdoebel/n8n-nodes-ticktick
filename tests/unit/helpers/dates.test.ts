import { describe, expect, test } from "bun:test";
import {
	formatDateStampYYYYMMDD,
	formatDateYYYYMMDD,
	formatISO8601WithMillis,
} from "../../../nodes/TickTick/helpers/dates";
import { formatTickTickDate } from "../../../nodes/TickTick/helpers/utils";

describe("Date Helper Functions", () => {
	describe("formatDateYYYYMMDD", () => {
		test("formats ISO date string to YYYYMMDD", () => {
			expect(formatDateYYYYMMDD("2024-03-15T10:30:00Z")).toBe("20240315");
		});

		test("formats date with different timezone", () => {
			expect(formatDateYYYYMMDD("2024-03-15T10:30:00+05:00")).toBe("20240315");
		});

		test("handles beginning of year", () => {
			expect(formatDateYYYYMMDD("2024-01-01T00:00:00Z")).toBe("20240101");
		});

		test("handles end of year", () => {
			expect(formatDateYYYYMMDD("2024-12-31T23:59:59Z")).toBe("20241231");
		});

		test("pads single-digit months", () => {
			expect(formatDateYYYYMMDD("2024-01-15T10:00:00Z")).toBe("20240115");
		});

		test("pads single-digit days", () => {
			expect(formatDateYYYYMMDD("2024-03-05T10:00:00Z")).toBe("20240305");
		});

		test("handles leap year date", () => {
			expect(formatDateYYYYMMDD("2024-02-29T12:00:00Z")).toBe("20240229");
		});

		test("preserves input timezone's date near day boundary", () => {
			expect(formatDateYYYYMMDD("2024-03-15T23:30:00-08:00")).toBe("20240315");
		});
	});

	describe("formatDateStampYYYYMMDD", () => {
		test("returns numeric date stamp", () => {
			expect(formatDateStampYYYYMMDD("2024-03-15T10:30:00Z")).toBe(20240315);
		});

		test("returns a number type", () => {
			const result = formatDateStampYYYYMMDD("2024-03-15T10:30:00Z");
			expect(typeof result).toBe("number");
		});

		test("pads single-digit months and days", () => {
			expect(formatDateStampYYYYMMDD("2024-01-05T00:00:00Z")).toBe(20240105);
		});

		test("handles December dates", () => {
			expect(formatDateStampYYYYMMDD("2024-12-25T00:00:00Z")).toBe(20241225);
		});

		test("preserves input timezone's date near day boundary", () => {
			expect(formatDateStampYYYYMMDD("2024-03-15T23:30:00-08:00")).toBe(
				20240315,
			);
		});
	});

	describe("formatISO8601WithMillis", () => {
		test("formats date with +0000 timezone", () => {
			const date = new Date("2024-03-15T10:30:00.123Z");
			expect(formatISO8601WithMillis(date)).toBe(
				"2024-03-15T10:30:00.000+0000",
			);
		});

		test("replaces milliseconds with .000", () => {
			const date = new Date("2024-03-15T10:30:00.999Z");
			const result = formatISO8601WithMillis(date);
			expect(result).toContain(".000+0000");
		});

		test("includes correct time components", () => {
			const date = new Date("2024-03-15T14:45:30.000Z");
			expect(formatISO8601WithMillis(date)).toBe(
				"2024-03-15T14:45:30.000+0000",
			);
		});

		test("handles midnight", () => {
			const date = new Date("2024-03-15T00:00:00.000Z");
			expect(formatISO8601WithMillis(date)).toBe(
				"2024-03-15T00:00:00.000+0000",
			);
		});

		test("handles end of day", () => {
			const date = new Date("2024-03-15T23:59:59.999Z");
			expect(formatISO8601WithMillis(date)).toBe(
				"2024-03-15T23:59:59.000+0000",
			);
		});
	});

	describe("formatTickTickDate", () => {
		test("formats ISO date string to TickTick format with offset", () => {
			const result = formatTickTickDate("2026-03-15T10:30:00Z");
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/);
		});

		test("returns undefined for empty string", () => {
			expect(formatTickTickDate("")).toBeUndefined();
		});

		test("returns undefined for invalid date string", () => {
			expect(formatTickTickDate("not-a-date")).toBeUndefined();
		});

		test("returns undefined for garbage input", () => {
			expect(formatTickTickDate("abc123xyz")).toBeUndefined();
		});

		test("preserves correct date components", () => {
			const result = formatTickTickDate("2026-03-15T10:30:45Z");
			expect(result).toBeDefined();
			expect(result).toContain("2026-");
			expect(result).toContain("T");
		});

		test("offset is 4 digits with sign", () => {
			const result = formatTickTickDate("2026-06-15T12:00:00Z");
			expect(result).toBeDefined();
			const offset = result!.slice(-5);
			expect(offset).toMatch(/^[+-]\d{4}$/);
		});

		test("preserves positive timezone offset from input", () => {
			expect(formatTickTickDate("2026-03-15T10:30:00+05:30")).toBe(
				"2026-03-15T10:30:00+0530",
			);
		});

		test("preserves negative timezone offset from input", () => {
			expect(formatTickTickDate("2026-03-15T10:30:00-08:00")).toBe(
				"2026-03-15T10:30:00-0800",
			);
		});

		test("formats UTC (Z) as +0000", () => {
			expect(formatTickTickDate("2026-03-15T10:30:00Z")).toBe(
				"2026-03-15T10:30:00+0000",
			);
		});

		test("does not shift hours when input offset differs from server", () => {
			expect(formatTickTickDate("2024-01-15T10:00:00+05:00")).toBe(
				"2024-01-15T10:00:00+0500",
			);
		});

		test("handles date-only input", () => {
			const result = formatTickTickDate("2026-03-15");
			expect(result).toBeDefined();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/);
		});

		test("handles midnight in local timezone", () => {
			const result = formatTickTickDate("2026-01-01T00:00:00");
			expect(result).toBeDefined();
			expect(result).toContain("T00:00:00");
		});
	});
});
