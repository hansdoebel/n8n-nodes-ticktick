import { describe, expect, test } from "bun:test";
import {
	formatDateStampYYYYMMDD,
	formatDateYYYYMMDD,
	formatISO8601WithMillis,
} from "../../../nodes/TickTick/helpers/dates";

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
	});

	describe("formatDateStampYYYYMMDD", () => {
		test("returns numeric date stamp", () => {
			const date = new Date("2024-03-15T10:30:00Z");
			expect(formatDateStampYYYYMMDD(date)).toBe(20240315);
		});

		test("returns a number type", () => {
			const date = new Date("2024-03-15T10:30:00Z");
			const result = formatDateStampYYYYMMDD(date);
			expect(typeof result).toBe("number");
		});

		test("pads single-digit months and days", () => {
			const date = new Date("2024-01-05T00:00:00Z");
			expect(formatDateStampYYYYMMDD(date)).toBe(20240105);
		});

		test("handles December dates", () => {
			const date = new Date("2024-12-25T00:00:00Z");
			expect(formatDateStampYYYYMMDD(date)).toBe(20241225);
		});

		test("handles current date", () => {
			const now = new Date();
			const result = formatDateStampYYYYMMDD(now);
			expect(result).toBeGreaterThan(20200101);
			expect(result).toBeLessThan(21000101);
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
});
