import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockUserProfileResponse } from "../../__mocks__/apiResponses";
import { userGetProfileExecute } from "../../../../nodes/TickTick/resources/user/operations/UserGetProfile";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("UserGetProfile Operation", () => {
	describe("userGetProfileExecute", () => {
		test("fetches user profile", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PROFILE,
				response: mockUserProfileResponse,
			});

			const result = await userGetProfileExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.USER_PROFILE);
		});

		test("returns user profile data", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PROFILE,
				response: mockUserProfileResponse,
			});

			const result = await userGetProfileExecute.call(mockContext as any, 0);

			expect(result[0].json.id).toBe("user123");
			expect(result[0].json.username).toBe("testuser");
			expect(result[0].json.email).toBe("test@example.com");
			expect(result[0].json.name).toBe("Test User");
		});

		test("handles profile with additional fields", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			const extendedProfile = {
				...mockUserProfileResponse,
				timezone: "America/New_York",
				createdAt: "2024-01-01T00:00:00Z",
			};

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_PROFILE,
				response: extendedProfile,
			});

			const result = await userGetProfileExecute.call(mockContext as any, 0);

			expect(result[0].json.timezone).toBe("America/New_York");
			expect(result[0].json.createdAt).toBe("2024-01-01T00:00:00Z");
		});
	});
});
