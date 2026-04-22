import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockSearchResponse } from "../../__mocks__/apiResponses";
import { taskSearchExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskSearch";
import { ENDPOINTS } from "../../../../nodes/TickTick/helpers/constants";

describe("TaskSearch Operation", () => {
	describe("taskSearchExecute", () => {
		test("returns tasks from response.tasks", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					keywords: "grocery",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SEARCH_ALL,
				response: mockSearchResponse,
			});

			const result = await taskSearchExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expect(result[0].json.id).toBe("search1");
			expect(result[1].json.id).toBe("search2");
			expectApiCalled(mockContext, "GET", ENDPOINTS.SEARCH_ALL);
		});

		test("passes keywords as query string", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					keywords: "grocery",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SEARCH_ALL,
				response: mockSearchResponse,
			});

			await taskSearchExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const searchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.SEARCH_ALL)
			);
			expect(searchCall).toBeDefined();
			expect(searchCall?.qs).toEqual({ keywords: "grocery" });
		});

		test("returns array directly when response is an array", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					keywords: "anything",
					limit: 0,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SEARCH_ALL,
				response: [
					{ id: "a1", title: "Task A" },
					{ id: "a2", title: "Task B" },
				],
			});

			const result = await taskSearchExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expect(result[0].json.id).toBe("a1");
		});

		test("applies limit to results", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					keywords: "grocery",
					limit: 1,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SEARCH_ALL,
				response: mockSearchResponse,
			});

			const result = await taskSearchExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.id).toBe("search1");
		});

		test("returns no items when search yields empty tasks array", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					keywords: "noresults",
					limit: 50,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SEARCH_ALL,
				response: { tasks: [] },
			});

			const result = await taskSearchExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});

		test("wraps unexpected response shape as a single item", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					keywords: "grocery",
					limit: 50,
				},
			});

			const unexpected = { somethingElse: true };
			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SEARCH_ALL,
				response: unexpected,
			});

			const result = await taskSearchExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(unexpected);
		});
	});
});
