import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockUserStatusResponse } from "../../__mocks__/apiResponses";
import { userGetStatusExecute } from "../../../../nodes/TickTick/resources/user/operations/UserGetStatus";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("UserGetStatus Operation", () => {
	describe("userGetStatusExecute", () => {
		test("fetches user status", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_STATUS,
				response: mockUserStatusResponse,
			});

			const result = await userGetStatusExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.USER_STATUS);
		});

		test("returns user status data", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_STATUS,
				response: mockUserStatusResponse,
			});

			const result = await userGetStatusExecute.call(mockContext as any, 0);

			expect(result[0].json.userId).toBe("user123");
			expect(result[0].json.isPro).toBe(false);
			expect(result[0].json.proEndDate).toBeNull();
		});

		test("handles pro user status", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			const proUserStatus = {
				userId: "user123",
				isPro: true,
				proEndDate: "2025-12-31T23:59:59Z",
			};

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.USER_STATUS,
				response: proUserStatus,
			});

			const result = await userGetStatusExecute.call(mockContext as any, 0);

			expect(result[0].json.isPro).toBe(true);
			expect(result[0].json.proEndDate).toBe("2025-12-31T23:59:59Z");
		});
	});
});
