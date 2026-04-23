import { DateTime } from "luxon";
import type {
	ProjectBody,
	ResourceLocatorValue,
	TaskBody,
} from "./types";

export function formatTickTickDate(dateString: string): string | undefined {
	if (!dateString) return undefined;

	const dt = DateTime.fromISO(dateString, { setZone: true });
	if (!dt.isValid) return undefined;

	return dt.toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ");
}

const SAFE_PATH_PARAM = /^[a-zA-Z0-9_-]+$/;

export function validatePathParam(value: string, name: string): string {
	if (!value || !SAFE_PATH_PARAM.test(value)) {
		throw new Error(
			`Invalid ${name}: must contain only letters, numbers, hyphens, or underscores`,
		);
	}
	return value;
}

export function extractResourceLocatorValue(
	value: string | ResourceLocatorValue | undefined,
): string {
	if (typeof value === "object" && value !== null) {
		return value.value || "";
	}
	return value || "";
}

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

export function parseReminders(reminders: string): string[] {
	return reminders
		.split(",")
		.map((r) => r.trim())
		.filter((r) => r.length > 0);
}

export function extractTagValue(
	tag: string | ResourceLocatorValue | undefined,
): string {
	if (typeof tag === "object" && tag !== null) {
		return tag.value || "";
	}
	return tag || "";
}
