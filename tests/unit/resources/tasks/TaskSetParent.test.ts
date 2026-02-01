import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import {
	mockSyncResponse,
	mockTaskBatchResponse,
} from "../../__mocks__/apiResponses";
import { taskSetParentExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskSetParent";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskSetParent Operation", () => {
	describe("taskSetParentExecute", () => {
		test("sets parent task", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					projectId: { mode: "id", value: "project456" },
					parentId: { mode: "id", value: "parentTask" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASKS_BATCH,
				response: mockTaskBatchResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.taskId).toBe("task123");
			expect(result[0].json.parentId).toBe("parentTask");
			expectApiCalled(mockContext, "POST", ENDPOINTS.TASKS_BATCH);
		});

		test("removes parent when parentId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					projectId: { mode: "id", value: "project456" },
					parentId: "",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASKS_BATCH,
				response: mockTaskBatchResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.parentId).toBeNull();

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASKS_BATCH));
			const body = batchCall?.body as { update: Array<{ parentId: string }> };
			expect(body.update[0].parentId).toBe("");
		});

		test("throws error when taskId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "" },
					projectId: { mode: "id", value: "project456" },
					parentId: "",
				},
			});

			await expect(taskSetParentExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Task ID is required",
				);
		});

		test("throws error when projectId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					projectId: { mode: "id", value: "" },
					parentId: "",
				},
			});

			await expect(taskSetParentExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Project ID is required",
				);
		});

		test("throws error when task not found", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "nonexistent" },
					projectId: { mode: "id", value: "project456" },
					parentId: "",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			await expect(taskSetParentExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Task with ID nonexistent not found",
				);
		});

		test("preserves existing task properties when setting parent", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					projectId: { mode: "id", value: "project456" },
					parentId: { mode: "id", value: "parentTask" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASKS_BATCH,
				response: mockTaskBatchResponse,
			});

			await taskSetParentExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASKS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].id).toBe("task123");
			expect(body.update[0].title).toBe("Test Task");
			expect(body.update[0].parentId).toBe("parentTask");
		});

		test("handles string parameter values", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: "task123",
					projectId: "project456",
					parentId: "parentTask",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASKS_BATCH,
				response: mockTaskBatchResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
		});
	});
});
