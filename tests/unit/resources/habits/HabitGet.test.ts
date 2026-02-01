import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockHabitsResponse } from "../../__mocks__/apiResponses";
import { habitGetExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitGet";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitGet Operation", () => {
	describe("habitGetExecute", () => {
		test("returns specific habit by ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			const result = await habitGetExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.id).toBe("habit123");
			expect(result[0].json.name).toBe("Exercise");
			expectApiCalled(mockContext, "GET", ENDPOINTS.HABITS);
		});

		test("returns second habit when requested", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit456",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			const result = await habitGetExecute.call(mockContext as any, 0);

			expect(result[0].json.id).toBe("habit456");
			expect(result[0].json.name).toBe("Read");
		});

		test("throws error when habit not found", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "nonexistent",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			await expect(habitGetExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Habit with ID nonexistent not found",
			);
		});

		test("throws error when habit ID is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "",
				},
			});

			await expect(habitGetExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Habit ID is required",
			);
		});

		test("throws error when habit ID is whitespace", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "   ",
				},
			});

			await expect(habitGetExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Habit ID is required",
			);
		});

		test("handles empty habits list", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: [],
			});

			await expect(habitGetExecute.call(mockContext as any, 0)).rejects.toThrow(
				"Habit with ID habit123 not found",
			);
		});
	});
});
