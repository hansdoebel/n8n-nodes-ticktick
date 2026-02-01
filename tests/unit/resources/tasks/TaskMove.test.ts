import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockSyncResponse } from "../../__mocks__/apiResponses";
import { taskMoveExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskMove";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskMove Operation", () => {
	describe("taskMoveExecute", () => {
		test("moves task to new project", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					toProjectId: { mode: "id", value: "newProject" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_PROJECT,
				response: {},
			});

			const result = await taskMoveExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.taskId).toBe("task123");
			expect(result[0].json.toProjectId).toBe("newProject");
			expect(result[0].json.fromProjectId).toBe("project456");
			expectApiCalled(mockContext, "POST", ENDPOINTS.TASK_PROJECT);
		});

		test("throws error when taskId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "" },
					toProjectId: { mode: "id", value: "newProject" },
				},
			});

			await expect(taskMoveExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Task ID is required",
			);
		});

		test("throws error when toProjectId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					toProjectId: { mode: "id", value: "" },
				},
			});

			await expect(taskMoveExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Destination Project ID is required",
			);
		});

		test("throws error when task not found", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "nonexistent" },
					toProjectId: { mode: "id", value: "newProject" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			await expect(taskMoveExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Task with ID nonexistent not found",
			);
		});

		test("sends correct move payload", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					toProjectId: { mode: "id", value: "destProject" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_PROJECT,
				response: {},
			});

			await taskMoveExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const moveCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TASK_PROJECT)
			);
			const body = moveCall?.body as Array<{
				taskId: string;
				fromProjectId: string;
				toProjectId: string;
			}>;
			expect(body[0].taskId).toBe("task123");
			expect(body[0].fromProjectId).toBe("project456");
			expect(body[0].toProjectId).toBe("destProject");
		});

		test("handles string parameter values", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: "task123",
					toProjectId: "newProject",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_PROJECT,
				response: {},
			});

			const result = await taskMoveExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
		});
	});
});
