import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import {
	mockSyncResponse,
	mockTaskBatchResponse,
} from "../../__mocks__/apiResponses";
import { taskDeleteExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskDelete";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskDelete Operation", () => {
	describe("taskDeleteExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("deletes task successfully", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						taskId: { mode: "id", value: "task123" },
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
					response: {},
				});

				const result = await taskDeleteExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.success).toBe(true);
				expect(result[0].json.operation).toBe("delete");
				expect(result[0].json.taskId).toBe("task123");
				expectApiCalled(
					mockContext,
					"DELETE",
					"/project/project456/task/task123",
				);
			});

			test("uses inbox as default projectId", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: "",
						taskId: { mode: "id", value: "task123" },
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("inbox", "task123"),
					response: {},
				});

				await taskDeleteExecute.call(mockContext as any, 0);

				expectApiCalled(mockContext, "DELETE", "/inbox/task/task123");
			});

			test("throws error when taskId is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						taskId: { mode: "id", value: "" },
					},
				});

				await expect(taskDeleteExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task ID is required",
					);
			});

			test("throws error when taskId is whitespace", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						projectId: "",
						taskId: "   ",
					},
				});

				await expect(taskDeleteExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task ID is required",
					);
			});
		});

		describe("V2 API (Session)", () => {
			test("deletes task via batch endpoint", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						taskId: { mode: "id", value: "task123" },
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

				const result = await taskDeleteExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.success).toBe(true);
				expectApiCalled(mockContext, "POST", ENDPOINTS.TASKS_BATCH);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASKS_BATCH));
				const body = batchCall?.body as {
					delete: Array<{ taskId: string; projectId: string }>;
				};
				expect(body.delete).toHaveLength(1);
				expect(body.delete[0].taskId).toBe("task123");
			});

			test("uses projectId from task when deleting via V2", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						projectId: "",
						taskId: { mode: "id", value: "task123" },
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

				await taskDeleteExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASKS_BATCH));
				const body = batchCall?.body as {
					delete: Array<{ projectId: string }>;
				};
				expect(body.delete[0].projectId).toBe("project456");
			});

			test("throws error when task not found in V2", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						taskId: { mode: "id", value: "nonexistent" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				await expect(taskDeleteExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task with ID nonexistent not found",
					);
			});
		});

		describe("Resource Locator Handling", () => {
			test("extracts values from resource locator objects", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "list", value: "project456" },
						taskId: { mode: "list", value: "task123" },
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
					response: {},
				});

				const result = await taskDeleteExecute.call(mockContext as any, 0);

				expect(result[0].json.taskId).toBe("task123");
				expect(result[0].json.projectId).toBe("project456");
			});

			test("handles string values directly", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: "project456",
						taskId: "task123",
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
					response: {},
				});

				const result = await taskDeleteExecute.call(mockContext as any, 0);

				expect(result[0].json.taskId).toBe("task123");
			});
		});
	});
});
