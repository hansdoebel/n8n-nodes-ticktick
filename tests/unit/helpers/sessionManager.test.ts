import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	DEFAULT_V2_DEVICE_VERSION,
	NEED_UPGRADE_CLIENT_CODE,
	NEED_UPGRADE_CLIENT_MESSAGE,
	buildDeviceHeader,
	clearV2Session,
	getV2Session,
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

const upgradeBody = {
	errorCode: NEED_UPGRADE_CLIENT_CODE,
	errorMessage: "need_upgrade_client",
};

function signonContext(httpRequest: () => Promise<unknown>) {
	const username = `upgrade-${crypto.randomUUID()}@example.com`;
	return {
		username,
		context: {
			getNode: () => ({
				id: "test-node-id",
				name: "TickTick",
				type: "n8n-nodes-ticktick.tickTick",
				typeVersion: 1,
				position: [0, 0],
				parameters: {},
			}),
			getCredentials: async () => ({
				username,
				password: "test-password",
			}),
			helpers: { httpRequest },
		} as unknown as Parameters<typeof getV2Session>[0],
	};
}

describe("authenticateV2 need_upgrade_client", () => {
	test("translates a rejected HTTP 500 with an object body", async () => {
		const { username, context } = signonContext(async () => {
			throw Object.assign(new Error("Request failed with status code 500"), {
				cause: {
					response: { status: 500, data: upgradeBody },
				},
			});
		});
		try {
			await expect(getV2Session(context)).rejects.toThrow(
				NEED_UPGRADE_CLIENT_MESSAGE,
			);
		} finally {
			clearV2Session(username);
		}
	});

	test("translates a rejected HTTP 500 with a JSON-string body", async () => {
		const { username, context } = signonContext(async () => {
			throw {
				response: {
					status: 500,
					body: JSON.stringify({
						errorId: NEED_UPGRADE_CLIENT_CODE,
						errorMessage: "need_upgrade_client",
					}),
				},
			};
		});
		try {
			await expect(getV2Session(context)).rejects.toThrow(
				NEED_UPGRADE_CLIENT_MESSAGE,
			);
		} finally {
			clearV2Session(username);
		}
	});

	test("rethrows an unrelated rejected error unchanged", async () => {
		const original = new Error("socket hang up");
		const { username, context } = signonContext(async () => {
			throw original;
		});
		try {
			await expect(getV2Session(context)).rejects.toBe(original);
		} finally {
			clearV2Session(username);
		}
	});

	test("keeps the success-path check for HTTP 200 with an error body", async () => {
		const { username, context } = signonContext(async () => ({
			body: upgradeBody,
			headers: {},
		}));
		try {
			await expect(getV2Session(context)).rejects.toThrow(
				NEED_UPGRADE_CLIENT_MESSAGE,
			);
		} finally {
			clearV2Session(username);
		}
	});
});
