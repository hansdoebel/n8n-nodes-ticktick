import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockFocusHeatmapResponse } from "../../__mocks__/apiResponses";
import { focusGetHeatmapExecute } from "../../../../nodes/TickTick/resources/focus/operations/FocusGetHeatmap";

describe("FocusGetHeatmap Operation", () => {
	describe("focusGetHeatmapExecute", () => {
		test("fetches heatmap data for date range", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/heatmap/,
				response: mockFocusHeatmapResponse,
			});

			const result = await focusGetHeatmapExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expectApiCalled(mockContext, "GET", "/pomodoros/statistics/heatmap");
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
				endpoint: /\/pomodoros\/statistics\/heatmap\/20240315\/20240320/,
				response: [],
			});

			await focusGetHeatmapExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			expect(calls[0].endpoint).toContain("20240315");
			expect(calls[0].endpoint).toContain("20240320");
		});

		test("maps each heatmap entry to json output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/heatmap/,
				response: mockFocusHeatmapResponse,
			});

			const result = await focusGetHeatmapExecute.call(mockContext as any, 0);

			expect(result[0].json).toEqual({ date: "20240115", duration: 3600 });
			expect(result[1].json).toEqual({ date: "20240116", duration: 7200 });
		});

		test("returns single item for non-array response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/heatmap/,
				response: { total: 10800 },
			});

			const result = await focusGetHeatmapExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual({ total: 10800 });
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
				focusGetHeatmapExecute.call(mockContext as any, 0),
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
				focusGetHeatmapExecute.call(mockContext as any, 0),
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
				focusGetHeatmapExecute.call(mockContext as any, 0),
			).rejects.toThrow("Start date must be before or equal to end date");
		});

		test("handles empty response array", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					startDate: "2024-01-01T00:00:00Z",
					endDate: "2024-01-31T00:00:00Z",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: /\/pomodoros\/statistics\/heatmap/,
				response: [],
			});

			const result = await focusGetHeatmapExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});
	});
});
