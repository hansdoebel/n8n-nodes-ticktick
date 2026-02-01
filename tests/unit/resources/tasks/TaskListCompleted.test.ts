import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockCompletedTasksResponse } from "../../__mocks__/apiResponses";
import { taskListCompletedExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskListCompleted";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskListCompleted Operation", () => {
	describe("taskListCompletedExecute", () => {
		test("retrieves completed tasks with date range", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T23:59:59Z",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_COMPLETED,
				response: mockCompletedTasksResponse,
			});

			const result = await taskListCompletedExecute.call(mockContext as any, 0);

			expect(result.length).toBeGreaterThan(0);
			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_ALL_COMPLETED);
		});

		test("returns array of tasks", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T23:59:59Z",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_COMPLETED,
				response: mockCompletedTasksResponse,
			});

			const result = await taskListCompletedExecute.call(mockContext as any, 0);

			expect(Array.isArray(result)).toBe(true);
			result.forEach((item) => {
				expect(item.json).toBeDefined();
			});
		});

		test("handles empty response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T23:59:59Z",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_COMPLETED,
				response: [],
			});

			const result = await taskListCompletedExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});

		test("handles non-array response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T23:59:59Z",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_COMPLETED,
				response: { message: "no tasks" },
			});

			const result = await taskListCompletedExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.message).toBe("no tasks");
		});

		test("applies limit parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T23:59:59Z",
					limit: 10,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_ALL_COMPLETED,
				response: mockCompletedTasksResponse,
			});

			await taskListCompletedExecute.call(mockContext as any, 0);

			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_ALL_COMPLETED);
		});
	});
});
