import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockHabitsResponse } from "../../__mocks__/apiResponses";
import { habitArchiveExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitArchive";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitArchive Operation", () => {
	describe("habitArchiveExecute", () => {
		test("archives habit by setting status to 2", async () => {
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

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: { id2etag: {} },
			});

			const result = await habitArchiveExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.HABITS);
			expectApiCalled(mockContext, "POST", ENDPOINTS.HABITS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].status).toBe(2);
		});

		test("preserves all habit data when archiving", async () => {
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

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitArchiveExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].id).toBe("habit123");
			expect(body.update[0].name).toBe("Exercise");
			expect(body.update[0].color).toBe("#97E38B");
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

			await expect(
				habitArchiveExecute.call(mockContext as any, 0),
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
				habitArchiveExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit ID is required");
		});

		test("uses update array in batch request", async () => {
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

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitArchiveExecute.call(mockContext as any, 0);

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
