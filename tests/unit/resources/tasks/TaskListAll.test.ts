import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import {
	mockDeletedTasksResponse,
	mockSyncResponse,
} from "../../__mocks__/apiResponses";
import { taskListAllExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskListAll";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskListAll Operation", () => {
	describe("taskListAllExecute", () => {
		test("retrieves all tasks from sync", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
					filters: {},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await taskListAllExecute.call(mockContext as any, 0);

			expect(result.length).toBeGreaterThan(0);
			expectApiCalled(mockContext, "GET", ENDPOINTS.SYNC);
		});

		test("filters by projectId", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
					filters: {
						projectId: { mode: "id", value: "project456" },
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await taskListAllExecute.call(mockContext as any, 0);

			result.forEach((item) => {
				expect(item.json.projectId).toBe("project456");
			});
		});

		test("applies limit to results", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 1,
					filters: {},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await taskListAllExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
		});

		test("includes deleted tasks when requested", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 100,
					filters: {
						includeDeleted: true,
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: mockDeletedTasksResponse,
			});

			await taskListAllExecute.call(mockContext as any, 0);

			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION);
		});

		test("handles completed status filter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
					filters: {
						status: "completed",
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_CLOSED,
				response: [],
			});

			await taskListAllExecute.call(mockContext as any, 0);

			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_ALL_CLOSED);
		});

		test("handles empty sync response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
					filters: {},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: { syncTaskBean: { update: [], add: [] } },
			});

			const result = await taskListAllExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
		});

		test("extracts projectId from resource locator", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
					filters: {
						projectId: { mode: "list", value: "project456" },
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await taskListAllExecute.call(mockContext as any, 0);

			result.forEach((item) => {
				expect(item.json.projectId).toBe("project456");
			});
		});
	});
});
