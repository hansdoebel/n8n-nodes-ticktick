import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NodeApiError } from "n8n-workflow";
import {
	DEFAULT_V2_DEVICE_VERSION,
	NEED_UPGRADE_CLIENT_CODE,
	NEED_UPGRADE_CLIENT_MESSAGE,
	V2_LOGIN_FAILURE_TTL_MS,
	V2_SESSION_TTL_MS,
	buildDeviceHeader,
	_setV2SessionClockForTests,
	clearV2Session,
	getV2Session,
	getV2SessionCacheStats,
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

function signonContext(
	httpRequest: (options?: { body?: string }) => Promise<unknown>,
	options?: { username?: string; password?: string },
) {
	const username = options?.username ??
		`upgrade-${crypto.randomUUID()}@example.com`;
	const password = options?.password ?? "test-password";
	return {
		username,
		password,
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
				password,
			}),
			helpers: { httpRequest },
		} as unknown as Parameters<typeof getV2Session>[0],
	};
}

function errorText(error: unknown): string {
	const chunks: string[] = [];
	const seen = new Set<unknown>();

	const visit = (value: unknown, depth: number) => {
		if (value == null || depth > 8 || seen.has(value)) return;
		if (
			typeof value === "string" || typeof value === "number" ||
			typeof value === "boolean"
		) {
			chunks.push(String(value));
			return;
		}
		if (typeof value !== "object") return;
		seen.add(value);
		try {
			const json = JSON.stringify(value);
			if (json) chunks.push(json);
		} catch {
			// Circular structures still get walked property by property.
		}
		for (const key of Object.getOwnPropertyNames(value)) {
			chunks.push(key);
			try {
				visit((value as Record<string, unknown>)[key], depth + 1);
			} catch {
				// Ignore throwing getters.
			}
		}
	};

	visit(error, 0);
	let current: unknown = error;
	const causes = new Set<unknown>();
	while (current && typeof current === "object" && !causes.has(current)) {
		causes.add(current);
		const cause = (current as { cause?: unknown }).cause;
		visit(cause, 0);
		current = cause;
	}
	return chunks.join("\n");
}

function passwordFromBody(body: string | undefined): string {
	return JSON.parse(body ?? "{}").password as string;
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

	test("wraps an unrelated rejected error without attaching it", async () => {
		const password = "socket-hangup-password";
		const original = Object.assign(new Error("socket hang up"), {
			config: { body: JSON.stringify({ password }) },
		});
		const { username, context } = signonContext(async () => {
			throw original;
		}, { password });
		try {
			let thrown: unknown;
			try {
				await getV2Session(context);
			} catch (error) {
				thrown = error;
			}
			expect(thrown).toBeInstanceOf(NodeApiError);
			expect(thrown).not.toBe(original);
			const apiError = thrown as NodeApiError;
			expect(apiError.message).toBe("TickTick sign-on request failed");
			expect(apiError.cause).not.toBe(original);
			expect(errorText(thrown)).not.toContain(password);
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

	test("rejects a non-JSON sign-on body", async () => {
		const { username, context } = signonContext(async () => ({
			body: "<html>not json</html>",
			headers: {},
		}));
		try {
			await expect(getV2Session(context)).rejects.toThrow(
				/unexpected response/i,
			);
		} finally {
			clearV2Session(username);
		}
	});
});

describe("V2 session cache key", () => {
	test("reuses a session for the same email and password", async () => {
		const username = `same-${crypto.randomUUID()}@example.com`;
		let calls = 0;
		const httpRequest = async () => {
			calls += 1;
			return { body: { token: "token-same", inboxId: "inbox" }, headers: {} };
		};
		const { context } = signonContext(httpRequest, {
			username,
			password: "correct-password",
		});
		try {
			const first = await getV2Session(context);
			const second = await getV2Session(context);
			expect(first.token).toBe("token-same");
			expect(second.token).toBe(first.token);
			expect(calls).toBe(1);
		} finally {
			clearV2Session(username);
		}
	});

	test("does not reuse a session for the same email and a different password", async () => {
		const username = `diff-${crypto.randomUUID()}@example.com`;
		let calls = 0;
		const httpRequest = async (options?: { body?: string }) => {
			calls += 1;
			const password = passwordFromBody(options?.body);
			if (password !== "correct-password") {
				throw Object.assign(new Error("Request failed with status code 401"), {
					statusCode: 401,
					config: { data: options?.body },
					response: {
						status: 401,
						data: {
							errorCode: "incorrect_password",
							errorMessage: "Incorrect password",
						},
					},
				});
			}
			return {
				body: { token: "token-correct", inboxId: "inbox" },
				headers: {},
			};
		};
		const correct = signonContext(httpRequest, {
			username,
			password: "correct-password",
		});
		const wrong = signonContext(httpRequest, {
			username,
			password: "wrong-password",
		});
		try {
			const session = await getV2Session(correct.context);
			await expect(getV2Session(wrong.context)).rejects.toThrow(
				/Incorrect password/,
			);
			const again = await getV2Session(correct.context);
			expect(session.token).toBe("token-correct");
			expect(again.token).toBe("token-correct");
			expect(calls).toBe(2);
		} finally {
			clearV2Session(username);
		}
	});

	test("changing the password performs a new login", async () => {
		const username = `changed-${crypto.randomUUID()}@example.com`;
		let calls = 0;
		const httpRequest = async (options?: { body?: string }) => {
			calls += 1;
			const password = passwordFromBody(options?.body);
			return {
				body: { token: `token-${password}`, inboxId: "inbox" },
				headers: {},
			};
		};
		const original = signonContext(httpRequest, {
			username,
			password: "old-password",
		});
		const changed = signonContext(httpRequest, {
			username,
			password: "new-password",
		});
		try {
			const first = await getV2Session(original.context);
			const second = await getV2Session(changed.context);
			expect(first.token).toBe("token-old-password");
			expect(second.token).toBe("token-new-password");
			expect(calls).toBe(2);

			const oldAgain = await getV2Session(original.context);
			expect(oldAgain.token).toBe("token-old-password");
			expect(calls).toBe(3);
		} finally {
			clearV2Session(username);
		}
	});

	test("treats email case and surrounding space as the same account", async () => {
		const id = crypto.randomUUID();
		const username = `Case.User.${id}@Example.com`;
		let calls = 0;
		const httpRequest = async () => {
			calls += 1;
			return { body: { token: "token-case", inboxId: "inbox" }, headers: {} };
		};
		const mixed = signonContext(httpRequest, {
			username,
			password: "same-password",
		});
		const normalized = signonContext(httpRequest, {
			username: `  ${username.toLowerCase()}  `,
			password: "same-password",
		});
		try {
			const first = await getV2Session(mixed.context);
			const second = await getV2Session(normalized.context);
			expect(second.token).toBe(first.token);
			expect(calls).toBe(1);
		} finally {
			clearV2Session(username);
			clearV2Session(`  ${username.toLowerCase()}  `);
		}
	});
});

describe("V2 sign-on error redaction", () => {
	test("does not include the password in the thrown error", async () => {
		const password = "s3cret-password-value";
		const username = `leak-${crypto.randomUUID()}@example.com`;
		const raw = Object.assign(
			new Error(`Request failed for ${password}`),
			{
				config: {
					data: JSON.stringify({ username, password }),
					body: { username, password },
				},
				response: {
					status: 401,
					data: {
						errorCode: "incorrect_password",
						errorMessage: "Incorrect password",
					},
				},
				cause: {
					request: { body: `password=${password}` },
				},
			},
		);
		const { context } = signonContext(async () => {
			throw raw;
		}, { username, password });

		try {
			let thrown: unknown;
			try {
				await getV2Session(context);
			} catch (error) {
				thrown = error;
			}

			expect(thrown).toBeInstanceOf(NodeApiError);
			const apiError = thrown as NodeApiError & {
				description?: string;
				messages?: string[];
			};
			expect(apiError.message).toContain("Incorrect password");
			expect(apiError.message).not.toContain(password);
			expect(apiError.description ?? "").not.toContain(password);
			expect(JSON.stringify(apiError)).not.toContain(password);
			expect(errorText(thrown)).not.toContain(password);
			expect(errorText(apiError.cause)).not.toContain(password);

			let second: unknown;
			try {
				await getV2Session(context);
			} catch (error) {
				second = error;
			}
			expect(errorText(second)).not.toContain(password);
		} finally {
			clearV2Session(username);
		}
	});
});

describe("V2 login failure cache and in-flight sharing", () => {
	test("does not retry a failed login until the failure window expires", async () => {
		let now = 1_700_000_000_000;
		_setV2SessionClockForTests(() => now);
		const username = `fail-${crypto.randomUUID()}@example.com`;
		let calls = 0;
		const { context } = signonContext(async () => {
			calls += 1;
			throw {
				statusCode: 401,
				response: {
					status: 401,
					data: {
						errorCode: "incorrect_password",
						errorMessage: "Incorrect password",
					},
				},
			};
		}, { username, password: "wrong-password" });

		try {
			const before = getV2SessionCacheStats().failures;
			await expect(getV2Session(context)).rejects.toThrow(/Incorrect password/);
			await expect(getV2Session(context)).rejects.toThrow(/Incorrect password/);
			expect(calls).toBe(1);
			expect(getV2SessionCacheStats().failures).toBe(before + 1);

			now += V2_LOGIN_FAILURE_TTL_MS + 1;
			await expect(getV2Session(context)).rejects.toThrow(/Incorrect password/);
			expect(calls).toBe(2);
			expect(getV2SessionCacheStats().failures).toBe(before + 1);
		} finally {
			_setV2SessionClockForTests();
			clearV2Session(username);
		}
	});

	test("shares one in-flight login across concurrent calls", async () => {
		const username = `flight-${crypto.randomUUID()}@example.com`;
		let calls = 0;
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const { context } = signonContext(async () => {
			calls += 1;
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			await gate;
			return { body: { token: "shared-token", inboxId: "inbox" }, headers: {} };
		}, { username, password: "shared-password" });

		try {
			const first = getV2Session(context);
			const second = getV2Session(context);
			for (let i = 0; i < 20 && calls < 1; i++) await Promise.resolve();
			release();
			const [a, b] = await Promise.all([first, second]);
			expect(a.token).toBe("shared-token");
			expect(b.token).toBe("shared-token");
			expect(calls).toBe(1);
		} finally {
			clearV2Session(username);
		}
	});

	test("does not share an in-flight login across different passwords", async () => {
		const username = `split-${crypto.randomUUID()}@example.com`;
		let calls = 0;
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const httpRequest = async (options?: { body?: string }) => {
			calls += 1;
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			await gate;
			return {
				body: {
					token: `token-${passwordFromBody(options?.body)}`,
					inboxId: "inbox",
				},
				headers: {},
			};
		};
		const alpha = signonContext(httpRequest, {
			username,
			password: "alpha-password",
		});
		const beta = signonContext(httpRequest, {
			username,
			password: "beta-password",
		});

		try {
			const first = getV2Session(alpha.context);
			const second = getV2Session(beta.context);
			for (let i = 0; i < 20 && calls < 2; i++) await Promise.resolve();
			expect(calls).toBe(2);
			release();
			const [a, b] = await Promise.all([first, second]);
			expect(a.token).toBe("token-alpha-password");
			expect(b.token).toBe("token-beta-password");
		} finally {
			clearV2Session(username);
		}
	});

	test("evicts expired session entries", async () => {
		let now = 1_700_000_000_000;
		_setV2SessionClockForTests(() => now);
		const userA = `evict-a-${crypto.randomUUID()}@example.com`;
		const userB = `evict-b-${crypto.randomUUID()}@example.com`;
		const httpRequest = async () => ({
			body: { token: "token-evict", inboxId: "inbox" },
			headers: {},
		});
		const contextA = signonContext(httpRequest, {
			username: userA,
			password: "password-a",
		}).context;
		const contextB = signonContext(httpRequest, {
			username: userB,
			password: "password-b",
		}).context;

		try {
			const before = getV2SessionCacheStats().sessions;
			await getV2Session(contextA);
			expect(getV2SessionCacheStats().sessions).toBe(before + 1);

			now += V2_SESSION_TTL_MS + 1;
			await getV2Session(contextB);
			expect(getV2SessionCacheStats().sessions).toBe(before + 1);
		} finally {
			_setV2SessionClockForTests();
			clearV2Session(userA);
			clearV2Session(userB);
		}
	});
});
