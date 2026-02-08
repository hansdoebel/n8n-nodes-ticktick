import { DateTime } from "luxon";
import type {
	ProjectBody,
	ResourceLocatorValue,
	TaskBody,
} from "@ticktick/types/api";

/**
 * Formats a date string to TickTick's expected format with timezone offset.
 * @param dateString - ISO date string to format
 * @returns Formatted date string or undefined if input is empty
 */
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

const SAFE_PATH_PARAM = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates that a value is safe to use in a URL path segment.
 * Prevents path traversal attacks (e.g. "../../admin") in dynamic endpoints.
 * @param value - The path parameter to validate
 * @param name - The parameter name (for error messages)
 * @returns The validated value
 */
export function validatePathParam(value: string, name: string): string {
	if (!value || !SAFE_PATH_PARAM.test(value)) {
		throw new Error(
			`Invalid ${name}: must contain only letters, numbers, hyphens, or underscores`,
		);
	}
	return value;
}

/**
 * Extracts the string value from a resource locator or returns the string directly.
 * Resource locators are objects with { mode: string, value: string } shape from n8n UI.
 * @param value - Either a string or a ResourceLocatorValue object
 * @returns The extracted string value
 */
export function extractResourceLocatorValue(
	value: string | ResourceLocatorValue | undefined,
): string {
	if (typeof value === "object" && value !== null) {
		return value.value || "";
	}
	return value || "";
}

/**
 * Sets a property on a target object only if the value is defined (not undefined, null, or empty string).
 * Useful for building API request bodies where undefined fields should be omitted.
 * @param target - The object to set the property on
 * @param key - The property key
 * @param value - The value to set (if defined)
 */
export function setIfDefined<
	T extends TaskBody | ProjectBody | Record<string, unknown>,
>(
	target: T,
	key: keyof T | string,
	value: unknown,
): void {
	if (value !== undefined && value !== "" && value !== null) {
		(target as Record<string, unknown>)[key as string] = value;
	}
}

/**
 * Parses a comma-separated string of reminders into an array.
 * @param reminders - Comma-separated reminder triggers
 * @returns Array of trimmed, non-empty reminder strings
 */
export function parseReminders(reminders: string): string[] {
	return reminders
		.split(",")
		.map((r) => r.trim())
		.filter((r) => r.length > 0);
}

/**
 * Extracts a tag value from either a string or resource locator object.
 * @param tag - Either a string tag name or a ResourceLocatorValue
 * @returns The extracted tag string
 */
export function extractTagValue(
	tag: string | ResourceLocatorValue | undefined,
): string {
	if (typeof tag === "object" && tag !== null) {
		return tag.value || "";
	}
	return tag || "";
}
