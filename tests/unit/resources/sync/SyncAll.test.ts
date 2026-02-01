import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockSyncResponse } from "../../__mocks__/apiResponses";
import { syncAllExecute } from "../../../../nodes/TickTick/resources/sync/operations/SyncAll";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("SyncAll Operation", () => {
	describe("syncAllExecute", () => {
		test("fetches all data from sync endpoint", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await syncAllExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", "/batch/check");
		});

		test("returns sync response with all data types", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await syncAllExecute.call(mockContext as any, 0);

			expect(result[0].json.syncTaskBean).toBeDefined();
			expect(result[0].json.projectProfiles).toBeDefined();
			expect(result[0].json.tags).toBeDefined();
		});

		test("includes tasks in sync response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await syncAllExecute.call(mockContext as any, 0);

			const tasks = result[0].json.syncTaskBean as {
				update: Array<{ id: string; title: string }>;
			};
			expect(tasks.update).toHaveLength(3);
			expect(tasks.update[0].title).toBe("Test Task");
		});

		test("includes projects in sync response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await syncAllExecute.call(mockContext as any, 0);

			const projects = result[0].json.projectProfiles as Array<{
				id: string;
				name: string;
			}>;
			expect(projects).toHaveLength(2);
			expect(projects[0].name).toBe("Test Project");
		});

		test("includes tags in sync response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await syncAllExecute.call(mockContext as any, 0);

			const tags = result[0].json.tags as Array<{ name: string }>;
			expect(tags).toHaveLength(3);
			expect(tags[0].name).toBe("work");
		});

		test("handles empty sync response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: {},
			});

			const result = await syncAllExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual({});
		});
	});
});
