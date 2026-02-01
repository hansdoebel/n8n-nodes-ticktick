import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { habitCreateExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitCreate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitCreate Operation", () => {
	describe("habitCreateExecute", () => {
		test("creates habit with name only", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Morning Exercise",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: { id2etag: {} },
			});

			const result = await habitCreateExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.HABITS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add).toHaveLength(1);
			expect(body.add[0].name).toBe("Morning Exercise");
		});

		test("uses default values when not specified", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Test Habit",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].type).toBe("Boolean");
			expect(body.add[0].color).toBe("#97E38B");
			expect(body.add[0].goal).toBe(1);
		});

		test("creates habit with custom color and goal", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Read Books",
					additionalFields: {
						color: "#FF0000",
						goal: 30,
						unit: "pages",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].color).toBe("#FF0000");
			expect(body.add[0].goal).toBe(30);
			expect(body.add[0].unit).toBe("pages");
		});

		test("parses reminders from comma-separated string", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Take Medicine",
					additionalFields: {
						reminders: "09:00, 21:00",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].reminders).toEqual(["09:00", "21:00"]);
		});

		test("creates numeric habit type", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Drink Water",
					additionalFields: {
						type: "Real",
						goal: 8,
						unit: "glasses",
						step: 1,
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].type).toBe("Real");
			expect(body.add[0].goal).toBe(8);
			expect(body.add[0].unit).toBe("glasses");
			expect(body.add[0].step).toBe(1);
		});

		test("includes encouragement message", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Workout",
					additionalFields: {
						encouragement: "Keep pushing!",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].encouragement).toBe("Keep pushing!");
		});

		test("throws error when name is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "",
					additionalFields: {},
				},
			});

			await expect(
				habitCreateExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit name is required and cannot be empty");
		});

		test("throws error when name is whitespace", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "   ",
					additionalFields: {},
				},
			});

			await expect(
				habitCreateExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit name is required and cannot be empty");
		});

		test("generates unique habit ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Test Habit",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABITS_BATCH,
				response: {},
			});

			await habitCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.HABITS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].id).toBeDefined();
			expect(typeof body.add[0].id).toBe("string");
			expect((body.add[0].id as string).length).toBeGreaterThan(0);
		});
	});
});
