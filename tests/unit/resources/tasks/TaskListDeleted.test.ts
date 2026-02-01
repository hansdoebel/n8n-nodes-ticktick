import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockDeletedTasksResponse } from "../../__mocks__/apiResponses";
import { taskListDeletedExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskListDeleted";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskListDeleted Operation", () => {
	describe("taskListDeletedExecute", () => {
		test("retrieves deleted tasks", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: mockDeletedTasksResponse,
			});

			const result = await taskListDeletedExecute.call(mockContext as any, 0);

			expect(result.length).toBeGreaterThan(0);
			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION);
		});

		test("handles array response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: [
					{ id: "deleted1", title: "Deleted Task 1" },
					{ id: "deleted2", title: "Deleted Task 2" },
				],
			});

			const result = await taskListDeletedExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expect(result[0].json.id).toBe("deleted1");
		});

		test("handles object response with tasks property", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: mockDeletedTasksResponse,
			});

			const result = await taskListDeletedExecute.call(mockContext as any, 0);

			expect(result.length).toBeGreaterThan(0);
		});

		test("handles empty response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: [],
			});

			const result = await taskListDeletedExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});

		test("handles response without tasks property", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: { message: "empty" },
			});

			const result = await taskListDeletedExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.message).toBe("empty");
		});

		test("applies limit parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					limit: 10,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION,
				response: [],
			});

			await taskListDeletedExecute.call(mockContext as any, 0);

			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION);
		});
	});
});
