import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockSyncResponse } from "../../__mocks__/apiResponses";
import { sampleTask } from "../../__mocks__/fixtures/tasks";
import { taskGetExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskGet";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskGet Operation", () => {
	describe("taskGetExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("retrieves task by projectId and taskId", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						taskId: { mode: "id", value: "task123" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
					response: sampleTask,
				});

				const result = await taskGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.id).toBe("task123");
				expectApiCalled(
					mockContext,
					"GET",
					ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
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
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("inbox", "task123"),
					response: sampleTask,
				});

				await taskGetExecute.call(mockContext as any, 0);

				expectApiCalled(
					mockContext,
					"GET",
					ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("inbox", "task123"),
				);
			});

			test("throws error when taskId is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						taskId: { mode: "id", value: "" },
					},
				});

				await expect(taskGetExecute.call(mockContext as any, 0)).rejects
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

				await expect(taskGetExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task ID is required",
					);
			});
		});

		describe("V2 API (Session)", () => {
			test("retrieves task from sync response", async () => {
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

				const result = await taskGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.id).toBe("task123");
				expectApiCalled(mockContext, "GET", ENDPOINTS.SYNC);
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

				await expect(taskGetExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task with ID nonexistent not found",
					);
			});
		});

		describe("Resource Locator Handling", () => {
			test("extracts taskId from resource locator object", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "list", value: "project456" },
						taskId: { mode: "list", value: "task123" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
					response: sampleTask,
				});

				const result = await taskGetExecute.call(mockContext as any, 0);

				expect(result[0].json.id).toBe("task123");
			});

			test("handles string taskId directly", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: "project456",
						taskId: "task123",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_BY_PROJECT("project456", "task123"),
					response: sampleTask,
				});

				const result = await taskGetExecute.call(mockContext as any, 0);

				expect(result[0].json.id).toBe("task123");
			});
		});
	});
});
