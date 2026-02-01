import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { habitUnarchiveExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitUnarchive";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitUnarchive Operation", () => {
	describe("habitUnarchiveExecute", () => {
		const archivedHabit = {
			id: "habitArchived",
			name: "Archived Habit",
			color: "#6495ED",
			goal: 1,
			status: 2, // ARCHIVED
			iconRes: "habit_default",
		};

		test("unarchives habit by setting status to 0", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habitArchived",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: [archivedHabit],
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: { id2etag: {} },
			});

			const result = await habitUnarchiveExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.HABITS);
			expectApiCalled(mockContext, "POST", ENDPOINTS.HABITS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].status).toBe(0);
		});

		test("preserves all habit data when unarchiving", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habitArchived",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: [archivedHabit],
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUnarchiveExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].id).toBe("habitArchived");
			expect(body.update[0].name).toBe("Archived Habit");
			expect(body.update[0].color).toBe("#6495ED");
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
				response: [archivedHabit],
			});

			await expect(
				habitUnarchiveExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit with ID nonexistent not found");
		});

		test("throws error when habit ID is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "",
				},
			});

			await expect(
				habitUnarchiveExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit ID is required");
		});

		test("uses update array in batch request", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habitArchived",
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: [archivedHabit],
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUnarchiveExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				add: unknown[];
				update: unknown[];
				delete: unknown[];
			};
			expect(body.add).toEqual([]);
			expect(body.update).toHaveLength(1);
			expect(body.delete).toEqual([]);
		});
	});
});
