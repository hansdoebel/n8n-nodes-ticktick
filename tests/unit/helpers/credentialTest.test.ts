import { afterEach, describe, expect, test } from "bun:test";
import type { ICredentialTestFunctions } from "n8n-workflow";
import { TickTickOAuth2Api } from "../../../credentials/TickTickOAuth2Api.credentials";
import { TickTickTokenApi } from "../../../credentials/TickTickTokenApi.credentials";
import { ENDPOINTS, TICKTICK_URLS } from "../../../nodes/TickTick/helpers/constants";
import {
	CREDENTIAL_TEST_TIMEOUT_MS,
	testTickTickSessionApi,
} from "../../../nodes/TickTick/helpers/credentialTest";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

function credential(username: string, password: string) {
	return { data: { username, password } };
}

describe("testTickTickSessionApi", () => {
	test("uses n8n's request helper with a timeout", async () => {
		let fetchCalls = 0;
		globalThis.fetch = (async () => {
			fetchCalls += 1;
			throw new Error("global fetch should not be used");
		}) as typeof fetch;

		let requestOptions: Record<string, unknown> | undefined;
		const helpers = {
			request: async (options: Record<string, unknown>) => {
				requestOptions = options;
				return {
					statusCode: 200,
					body: JSON.stringify({ token: "session-token" }),
				};
			},
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential("user@example.com", "correct-password"),
		);

		expect(result).toEqual({
			status: "OK",
			message: "Authentication successful",
		});
		expect(fetchCalls).toBe(0);
		expect(requestOptions?.method).toBe("POST");
		expect(requestOptions?.timeout).toBe(CREDENTIAL_TEST_TIMEOUT_MS);
		expect(requestOptions?.url).toBe(
			`${TICKTICK_URLS.API_BASE_URL}/api/v2/user/signon?wc=true&remember=true`,
		);
		expect(String(requestOptions?.body)).toContain("correct-password");
		expect(requestOptions?.json).toBe(false);
		expect(requestOptions?.resolveWithFullResponse).toBe(true);
		expect(requestOptions?.simple).toBe(false);
	});

	test("prefers httpRequest when the credential test helpers provide it", async () => {
		let usedHttpRequest = false;
		const helpers = {
			request: async () => {
				throw new Error("deprecated request helper should not be used");
			},
			httpRequest: async (options: { timeout?: number; url?: string }) => {
				usedHttpRequest = true;
				expect(options.timeout).toBe(CREDENTIAL_TEST_TIMEOUT_MS);
				expect(options.url).toContain("/api/v2/user/signon");
				return {
					statusCode: 200,
					body: JSON.stringify({ token: "from-http-request" }),
				};
			},
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential("user@example.com", "correct-password"),
		);

		expect(usedHttpRequest).toBe(true);
		expect(result.status).toBe("OK");
	});

	test("returns TickTick's error message without the password", async () => {
		const password = "s3cret-password-value";
		const helpers = {
			request: async () => ({
				statusCode: 401,
				body: JSON.stringify({
					errorCode: "incorrect_password",
					errorMessage: "Incorrect password",
				}),
			}),
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential("user@example.com", password),
		);

		expect(result.status).toBe("Error");
		expect(result.message).toBe("Incorrect password");
		expect(result.message).not.toContain(password);
	});

	test("strips the password from a thrown request error", async () => {
		const password = "s3cret-password-value";
		const helpers = {
			request: async () => {
				throw new Error(
					`timeout posting {"password":"${password}"}`,
				);
			},
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential("user@example.com", password),
		);

		expect(result.status).toBe("Error");
		expect(result.message).toBe("Authentication failed");
		expect(result.message).not.toContain(password);
	});

	test("falls back to fetch with a timeout when the request helper is missing", async () => {
		let signal: AbortSignal | undefined;
		globalThis.fetch = (async (_url: string, init?: RequestInit) => {
			signal = init?.signal ?? undefined;
			return new Response(JSON.stringify({ token: "from-fetch" }), {
				status: 200,
			});
		}) as typeof fetch;

		const context = {} as ICredentialTestFunctions;
		const result = await testTickTickSessionApi.call(
			context,
			credential("user@example.com", "correct-password"),
		);

		expect(result.status).toBe("OK");
		expect(signal).toBeInstanceOf(AbortSignal);
		expect(signal?.aborted).toBe(false);
	});

	test("reports an unexpected sign-on body", async () => {
		const helpers = {
			request: async () => ({
				statusCode: 200,
				body: "<html>nope</html>",
			}),
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential("user@example.com", "correct-password"),
		);

		expect(result).toEqual({
			status: "Error",
			message: "TickTick sign-on returned an unexpected response",
		});
	});
});

describe("credential definitions", () => {
	test("OAuth2 scope is tasks:read tasks:write", () => {
		const credentialType = new TickTickOAuth2Api();
		const scope = credentialType.properties.find((property) =>
			property.name === "scope"
		);
		expect(scope?.default).toBe("tasks:read tasks:write");
	});

	test("token credential test calls the Open API host", () => {
		const credentialType = new TickTickTokenApi();
		expect(credentialType.test.request.baseURL).toBe(TICKTICK_URLS.API_BASE_URL);
		expect(credentialType.test.request.url).toBe(ENDPOINTS.OPEN_V1_PROJECT);
		expect(credentialType.test.request.baseURL).not.toBe(TICKTICK_URLS.BASE_URL);
	});
});
