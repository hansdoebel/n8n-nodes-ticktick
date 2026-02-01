import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockUserPreferencesResponse } from "../../__mocks__/apiResponses";
import { userGetPreferencesExecute } from "../../../../nodes/TickTick/resources/user/operations/UserGetPreferences";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("UserGetPreferences Operation", () => {
	describe("userGetPreferencesExecute", () => {
		test("fetches user preferences", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PREFERENCES_SETTINGS,
				response: mockUserPreferencesResponse,
			});

			const result = await userGetPreferencesExecute.call(
				mockContext as any,
				0,
			);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.USER_PREFERENCES_SETTINGS);
		});

		test("returns user preferences data", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PREFERENCES_SETTINGS,
				response: mockUserPreferencesResponse,
			});

			const result = await userGetPreferencesExecute.call(
				mockContext as any,
				0,
			);

			expect(result[0].json.timeZone).toBe("America/New_York");
			expect(result[0].json.weekStart).toBe(0);
			expect(result[0].json.dateFormat).toBe("MM/dd/yyyy");
			expect(result[0].json.timeFormat).toBe("12");
		});

		test("passes includeWeb query parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PREFERENCES_SETTINGS,
				response: mockUserPreferencesResponse,
			});

			await userGetPreferencesExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const prefsCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.USER_PREFERENCES_SETTINGS)
			);
			expect(prefsCall?.qs).toEqual({ includeWeb: "true" });
		});

		test("handles preferences with additional settings", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			const extendedPreferences = {
				...mockUserPreferencesResponse,
				theme: "dark",
				language: "en",
				sound: true,
			};

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PREFERENCES_SETTINGS,
				response: extendedPreferences,
			});

			const result = await userGetPreferencesExecute.call(
				mockContext as any,
				0,
			);

			expect(result[0].json.theme).toBe("dark");
			expect(result[0].json.language).toBe("en");
			expect(result[0].json.sound).toBe(true);
		});
	});
});
