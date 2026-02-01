import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockFocusDistributionResponse } from "../../__mocks__/apiResponses";
import { focusGetDistributionExecute } from "../../../../nodes/TickTick/resources/focus/operations/FocusGetDistribution";

describe("FocusGetDistribution Operation", () => {
	describe("focusGetDistributionExecute", () => {
		test("fetches distribution data for date range", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/dist/,
				response: mockFocusDistributionResponse,
			});

			const result = await focusGetDistributionExecute.call(
				mockContext as any,
				0,
			);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", "/pomodoros/statistics/dist");
		});

		test("formats dates correctly in endpoint", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-03-15T10:00:00Z",
					endDate: "2024-03-20T10:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/dist\/20240315\/20240320/,
				response: {},
			});

			await focusGetDistributionExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			expect(calls[0].endpoint).toContain("20240315");
			expect(calls[0].endpoint).toContain("20240320");
		});

		test("returns distribution with total and breakdown", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/dist/,
				response: mockFocusDistributionResponse,
			});

			const result = await focusGetDistributionExecute.call(
				mockContext as any,
				0,
			);

			expect(result[0].json.total).toBe(36000);
			expect(result[0].json.distribution).toHaveLength(2);
		});

		test("throws error when start date is missing", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			await expect(
				focusGetDistributionExecute.call(mockContext as any, 0),
			).rejects.toThrow("Start date is required");
		});

		test("throws error when end date is missing", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "",
				},
			});

			await expect(
				focusGetDistributionExecute.call(mockContext as any, 0),
			).rejects.toThrow("End date is required");
		});

		test("throws error when start date is after end date", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-31T00:00:00Z",
					endDate: "2024-01-01T00:00:00Z",
				},
			});

			await expect(
				focusGetDistributionExecute.call(mockContext as any, 0),
			).rejects.toThrow("Start date must be before or equal to end date");
		});
	});
});
