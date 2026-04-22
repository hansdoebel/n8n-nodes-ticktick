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
import { ENDPOINTS } from "../../../../nodes/TickTick/helpers/constants";

const syncResponseWithParentedChild = {
	...mockSyncResponse,
	syncTaskBean: {
		...mockSyncResponse.syncTaskBean,
		update: [
			{
				id: "task123",
				projectId: "project456",
				title: "Test Task",
				parentId: "oldParent",
				status: 0,
				priority: 0,
				tags: [],
				items: [],
			},
			{
				id: "parentTask",
				projectId: "project456",
				title: "Parent Task",
				status: 0,
				priority: 0,
				tags: [],
				items: [],
			},
			{
				id: "oldParent",
				projectId: "project456",
				title: "Old Parent",
				status: 0,
				priority: 0,
				tags: [],
				items: [],
			},
		],
	},
};

describe("TaskSetParent Operation", () => {
	describe("taskSetParentExecute", () => {
		test("sets parent task", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
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
				endpoint: ENDPOINTS.TASK_PARENT,
				response: mockTaskBatchResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.taskId).toBe("task123");
			expect(result[0].json.parentId).toBe("parentTask");
			expectApiCalled(mockContext, "POST", ENDPOINTS.TASK_PARENT);
		});

		test("sends correct set-parent payload", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
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
				endpoint: ENDPOINTS.TASK_PARENT,
				response: mockTaskBatchResponse,
			});

			await taskSetParentExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const parentCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TASK_PARENT)
			);
			const body = parentCall?.body as Array<Record<string, unknown>>;
			expect(Array.isArray(body)).toBe(true);
			expect(body).toHaveLength(1);
			expect(body[0]).toEqual({
				taskId: "task123",
				parentId: "parentTask",
				projectId: "project456",
			});
		});

		test("includes oldParentId when changing parent", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					parentId: { mode: "id", value: "parentTask" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: syncResponseWithParentedChild,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_PARENT,
				response: mockTaskBatchResponse,
			});

			await taskSetParentExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const parentCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TASK_PARENT)
			);
			const body = parentCall?.body as Array<Record<string, unknown>>;
			expect(body[0]).toEqual({
				taskId: "task123",
				parentId: "parentTask",
				projectId: "project456",
				oldParentId: "oldParent",
			});
		});

		test("removes parent using oldParentId when task has an existing parent", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					parentId: "",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: syncResponseWithParentedChild,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_PARENT,
				response: mockTaskBatchResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.parentId).toBeNull();

			const calls = mockContext._getApiCalls();
			const parentCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TASK_PARENT)
			);
			const body = parentCall?.body as Array<Record<string, unknown>>;
			expect(body[0]).toEqual({
				taskId: "task123",
				projectId: "project456",
				oldParentId: "oldParent",
			});
			expect(body[0].parentId).toBeUndefined();
		});

		test("no-op when removing parent on a task without one", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					parentId: "",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.parentId).toBeNull();

			const calls = mockContext._getApiCalls();
			const parentCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TASK_PARENT)
			);
			expect(parentCall).toBeUndefined();
		});

		test("throws error when taskId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "" },
					parentId: { mode: "id", value: "parentTask" },
				},
			});

			await expect(taskSetParentExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Task ID is required",
				);
		});

		test("throws error when parent task not found", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "task123" },
					parentId: { mode: "id", value: "nonexistentParent" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			await expect(taskSetParentExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Parent task with ID nonexistentParent not found",
				);
		});

		test("throws error when task not found", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: { mode: "id", value: "nonexistent" },
					parentId: { mode: "id", value: "parentTask" },
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

		test("handles string parameter values", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					taskId: "task123",
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
				endpoint: ENDPOINTS.TASK_PARENT,
				response: mockTaskBatchResponse,
			});

			const result = await taskSetParentExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
		});
	});
});
