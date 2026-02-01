import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockHabitsResponse } from "../../__mocks__/apiResponses";
import { habitListExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitList";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitList Operation", () => {
	describe("habitListExecute", () => {
		test("returns all active habits", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					includeArchived: false,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			const result = await habitListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expectApiCalled(mockContext, "GET", ENDPOINTS.HABITS);
		});

		test("maps each habit to json output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					includeArchived: false,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			const result = await habitListExecute.call(mockContext as any, 0);

			expect(result[0].json.id).toBe("habit123");
			expect(result[0].json.name).toBe("Exercise");
			expect(result[1].json.id).toBe("habit456");
			expect(result[1].json.name).toBe("Read");
		});

		test("filters out archived habits by default", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					includeArchived: false,
				},
			});

			const habitsWithArchived = [
				...mockHabitsResponse,
				{
					id: "habitArchived",
					name: "Archived Habit",
					status: 2, // ARCHIVED
				},
			];

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: habitsWithArchived,
			});

			const result = await habitListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expect(result.find((r) => r.json.id === "habitArchived")).toBeUndefined();
		});

		test("includes archived habits when requested", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					includeArchived: true,
				},
			});

			const habitsWithArchived = [
				...mockHabitsResponse,
				{
					id: "habitArchived",
					name: "Archived Habit",
					status: 2,
				},
			];

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: habitsWithArchived,
			});

			const result = await habitListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(3);
			expect(result.find((r) => r.json.id === "habitArchived")).toBeDefined();
		});

		test("returns empty array when no habits exist", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					includeArchived: false,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: [],
			});

			const result = await habitListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});

		test("handles non-array response gracefully", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					includeArchived: false,
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: null,
			});

			const result = await habitListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});
	});
});
