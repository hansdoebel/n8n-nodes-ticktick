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
	test("uses n8n's httpRequest helper with a timeout", async () => {
		let fetchCalls = 0;
		globalThis.fetch = (async () => {
			fetchCalls += 1;
			throw new Error("global fetch should not be used");
		}) as typeof fetch;

		let requestOptions: Record<string, unknown> | undefined;
		const helpers = {
			request: async () => {
				throw new Error("deprecated request helper should not be used");
			},
			httpRequest: async (options: Record<string, unknown>) => {
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
		expect(requestOptions?.returnFullResponse).toBe(true);
		expect(requestOptions?.ignoreHttpStatusErrors).toBe(true);
	});

	test("returns TickTick's error message without the password", async () => {
		const password = "s3cret-password-value";
		const helpers = {
			httpRequest: async () => ({
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
			httpRequest: async () => {
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

	function assertResultOmitsSecrets(
		result: { status: string; message: string },
		...secrets: string[]
	) {
		const blob = [result.status, result.message, JSON.stringify(result)].join("\n");
		for (const secret of secrets) {
			expect(blob.includes(secret)).toBe(false);
			expect(blob.toLowerCase().includes(secret.toLowerCase())).toBe(false);
		}
	}

	test("omits the email when TickTick returns it as the error message", async () => {
		const password = "s3cret-password-value";
		const username = `User.Name.${crypto.randomUUID()}@Example.com`;
		const helpers = {
			httpRequest: async () => ({
				statusCode: 500,
				body: JSON.stringify({
					errorCode: "username_password_not_match",
					errorMessage: username.toLowerCase(),
				}),
			}),
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential(username, password),
		);

		expect(result.status).toBe("Error");
		assertResultOmitsSecrets(result, username, password);
		expect(result.message).toContain("HTTP 500");
		expect(result.message).toContain("username_password_not_match");
		expect(result.message).not.toContain("@");
	});

	test.each([401, 403, 502])(
		"reports HTTP %s without the email or password",
		async (statusCode) => {
			const password = `pw-${statusCode}-secret`;
			const username = `cred-${statusCode}-${crypto.randomUUID()}@example.com`;
			const errorCode = statusCode === 502
				? "internal_error"
				: "username_password_not_match";
			const helpers = {
				httpRequest: async () => ({
					statusCode,
					body: JSON.stringify({
						errorCode,
						errorMessage: `failed for ${username}`,
						password,
					}),
				}),
			};
			const context = { helpers } as unknown as ICredentialTestFunctions;

			const result = await testTickTickSessionApi.call(
				context,
				credential(username, password),
			);

			expect(result.status).toBe("Error");
			assertResultOmitsSecrets(result, username, password);
			expect(result.message).toContain(`HTTP ${statusCode}`);
			expect(result.message).toContain(errorCode);
			expect(result.message).toContain("failed for");
		},
	);

	test("omits the email from a 200 sign-on body that has no token", async () => {
		const password = "s3cret-password-value";
		const username = `nobody-${crypto.randomUUID()}@example.com`;
		const helpers = {
			httpRequest: async () => ({
				statusCode: 200,
				body: JSON.stringify({
					errorCode: "username_password_not_match",
					errorMessage: username,
				}),
			}),
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential(username, password),
		);

		expect(result.status).toBe("Error");
		assertResultOmitsSecrets(result, username, password);
		expect(result.message).toContain("username_password_not_match");
		expect(result.message).toContain("check your credentials");
	});

	test("omits the email from a thrown network error", async () => {
		const password = "s3cret-password-value";
		const username = `down-${crypto.randomUUID()}@example.com`;
		const helpers = {
			httpRequest: async () => {
				throw new Error(`getaddrinfo ENOTFOUND while calling for ${username}`);
			},
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential(username, password),
		);

		expect(result.status).toBe("Error");
		assertResultOmitsSecrets(result, username, password);
		expect(result.message).toContain("getaddrinfo ENOTFOUND");
	});

	test("replaces a thrown error that contains the password and the email", async () => {
		const password = "s3cret-password-value";
		const username = `dump-${crypto.randomUUID()}@example.com`;
		const helpers = {
			httpRequest: async () => {
				throw new Error(
					`timeout posting {"username":"${username}","password":"${password}"}`,
				);
			},
		};
		const context = { helpers } as unknown as ICredentialTestFunctions;

		const result = await testTickTickSessionApi.call(
			context,
			credential(username, password),
		);

		expect(result).toEqual({
			status: "Error",
			message: "Authentication failed",
		});
		assertResultOmitsSecrets(result, username, password);
	});

	test("reports an unexpected sign-on body", async () => {
		const helpers = {
			httpRequest: async () => ({
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
