import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockHabitsResponse } from "../../__mocks__/apiResponses";
import { habitUpdateExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitUpdate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitUpdate Operation", () => {
	describe("habitUpdateExecute", () => {
		test("updates habit name", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					updateFields: {
						name: "Morning Workout",
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: { id2etag: {} },
			});

			const result = await habitUpdateExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.HABITS);
			expectApiCalled(mockContext, "POST", ENDPOINTS.HABITS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].name).toBe("Morning Workout");
		});

		test("preserves existing habit data when updating", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					updateFields: {
						color: "#FF0000",
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			// Original name preserved
			expect(body.update[0].name).toBe("Exercise");
			// New color applied
			expect(body.update[0].color).toBe("#FF0000");
		});

		test("updates goal and step", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					updateFields: {
						goal: 5,
						step: 1,
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].goal).toBe(5);
			expect(body.update[0].step).toBe(1);
		});

		test("updates reminders from comma-separated string", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					updateFields: {
						reminders: "08:00, 12:00, 18:00",
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].reminders).toEqual(["08:00", "12:00", "18:00"]);
		});

		test("maps icon to iconRes field", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					updateFields: {
						icon: "habit_run",
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].iconRes).toBe("habit_run");
		});

		test("throws error when habit not found", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "nonexistent",
					updateFields: {
						name: "New Name",
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			await expect(
				habitUpdateExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit with ID nonexistent not found");
		});

		test("throws error when habit ID is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "",
					updateFields: {},
				},
			});

			await expect(
				habitUpdateExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit ID is required");
		});

		test("updates multiple fields at once", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					updateFields: {
						name: "Updated Habit",
						color: "#0000FF",
						goal: 10,
						unit: "reps",
						encouragement: "You got this!",
						targetDays: 30,
					},
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.HABITS,
				response: mockHabitsResponse,
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].name).toBe("Updated Habit");
			expect(body.update[0].color).toBe("#0000FF");
			expect(body.update[0].goal).toBe(10);
			expect(body.update[0].unit).toBe("reps");
			expect(body.update[0].encouragement).toBe("You got this!");
			expect(body.update[0].targetDays).toBe(30);
		});
	});
});
