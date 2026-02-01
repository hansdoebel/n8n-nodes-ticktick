import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { taskAssignExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskAssign";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskAssign Operation", () => {
	describe("taskAssignExecute", () => {
		test("assigns task to user", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "sharedProject" },
					taskId: { mode: "id", value: "task123" },
					assignee: { mode: "id", value: "user456" },
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_ASSIGN,
				response: { success: true },
			});

			const result = await taskAssignExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expectApiCalled(mockContext, "POST", ENDPOINTS.TASK_ASSIGN);
		});

		test("sends correct assignment payload", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "sharedProject" },
					taskId: { mode: "id", value: "task123" },
					assignee: { mode: "id", value: "user456" },
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_ASSIGN,
				response: {},
			});

			await taskAssignExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const assignCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASK_ASSIGN));
			const body = assignCall?.body as Array<{
				assignee: string;
				projectId: string;
				taskId: string;
			}>;
			expect(body[0].assignee).toBe("user456");
			expect(body[0].projectId).toBe("sharedProject");
			expect(body[0].taskId).toBe("task123");
		});

		test("throws error when projectId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "" },
					taskId: { mode: "id", value: "task123" },
					assignee: { mode: "id", value: "user456" },
				},
			});

			await expect(taskAssignExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Project ID is required",
				);
		});

		test("throws error when taskId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "sharedProject" },
					taskId: { mode: "id", value: "" },
					assignee: { mode: "id", value: "user456" },
				},
			});

			await expect(taskAssignExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Task ID is required",
				);
		});

		test("throws error when assignee is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "sharedProject" },
					taskId: { mode: "id", value: "task123" },
					assignee: { mode: "id", value: "" },
				},
			});

			await expect(taskAssignExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Assignee is required",
				);
		});

		test("handles string parameter values", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: "sharedProject",
					taskId: "task123",
					assignee: "user456",
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TASK_ASSIGN,
				response: { success: true },
			});

			const result = await taskAssignExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
		});

		test("handles whitespace-only values as empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: "   ",
					taskId: "task123",
					assignee: "user456",
				},
			});

			await expect(taskAssignExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Project ID is required",
				);
		});
	});
});
