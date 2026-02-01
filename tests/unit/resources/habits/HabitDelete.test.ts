import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { habitDeleteExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitDelete";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitDelete Operation", () => {
	describe("habitDeleteExecute", () => {
		test("deletes habit by ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: { id2etag: {} },
			});

			const result = await habitDeleteExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.HABITS_BATCH);
		});

		test("sends delete array with habit ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit456",
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitDeleteExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as {
				add: unknown[];
				update: unknown[];
				delete: string[];
			};
			expect(body.add).toEqual([]);
			expect(body.update).toEqual([]);
			expect(body.delete).toEqual(["habit456"]);
		});

		test("throws error when habit ID is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "",
				},
			});

			await expect(
				habitDeleteExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit ID is required");
		});

		test("throws error when habit ID is whitespace", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "   ",
				},
			});

			await expect(
				habitDeleteExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit ID is required");
		});

		test("returns API response", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
				},
			});

			const mockResponse = {
				id2etag: { habit123: "deleted" },
				id2error: {},
			};

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: mockResponse,
			});

			const result = await habitDeleteExecute.call(mockContext as any, 0);

			expect(result[0].json).toEqual(mockResponse);
		});
	});
});
