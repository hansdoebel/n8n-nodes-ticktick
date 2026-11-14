import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	DEFAULT_V2_DEVICE_VERSION,
	NEED_UPGRADE_CLIENT_CODE,
	NEED_UPGRADE_CLIENT_MESSAGE,
	buildDeviceHeader,
	v2SignonFailureMessage,
} from "../../../nodes/TickTick/helpers/sessionManager";
import {
	DEFAULT_V2_DEVICE_VERSION as TEST_CLIENT_DEVICE_VERSION,
	buildDeviceHeader as testClientBuildDeviceHeader,
} from "../../integration/utils/testClient";

describe("V2 device version", () => {
	test("DEFAULT_V2_DEVICE_VERSION is a positive integer", () => {
		expect(DEFAULT_V2_DEVICE_VERSION).toBeGreaterThan(0);
		expect(Number.isInteger(DEFAULT_V2_DEVICE_VERSION)).toBe(true);
	});

	test("buildDeviceHeader uses DEFAULT_V2_DEVICE_VERSION by default", () => {
		const header = buildDeviceHeader("abc123");
		expect(header).toBe(
			`{"platform": "web", "version": ${DEFAULT_V2_DEVICE_VERSION}, "id": "abc123"}`,
		);
	});

	test("buildDeviceHeader accepts an explicit device version override", () => {
		const header = buildDeviceHeader("abc123", 6430);
		expect(header).toBe(
			'{"platform": "web", "version": 6430, "id": "abc123"}',
		);
	});

	test("integration testClient uses the shared DEFAULT_V2_DEVICE_VERSION", () => {
		expect(TEST_CLIENT_DEVICE_VERSION).toBe(DEFAULT_V2_DEVICE_VERSION);

		const deviceId = "shared-device-id";
		expect(testClientBuildDeviceHeader(deviceId)).toBe(
			buildDeviceHeader(deviceId),
		);

		const testClientSource = readFileSync(
			join(import.meta.dir, "../../integration/utils/testClient.ts"),
			"utf-8",
		);
		expect(testClientSource).toContain(
			"DEFAULT_V2_DEVICE_VERSION",
		);
		expect(testClientSource).not.toMatch(
			/const\s+V2_DEVICE_VERSION\s*=\s*\d+/,
		);
	});
});

describe("v2SignonFailureMessage", () => {
	test("surfaces a clear message for need_upgrade_client", () => {
		expect(
			v2SignonFailureMessage(
				NEED_UPGRADE_CLIENT_CODE,
				"need_upgrade_client",
			),
		).toBe(NEED_UPGRADE_CLIENT_MESSAGE);
		expect(NEED_UPGRADE_CLIENT_MESSAGE).toContain(
			"TickTick requires a newer client version",
		);
	});

	test("passes through other TickTick error messages", () => {
		expect(v2SignonFailureMessage("other_error", "boom")).toBe("boom");
	});

	test("falls back when no message is provided", () => {
		expect(v2SignonFailureMessage()).toBe("Please check your credentials.");
	});
});
