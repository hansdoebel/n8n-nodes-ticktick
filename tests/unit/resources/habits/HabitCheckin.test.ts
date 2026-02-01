import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { habitCheckinExecute } from "../../../../nodes/TickTick/resources/habits/operations/HabitCheckin";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("HabitCheckin Operation", () => {
	describe("habitCheckinExecute", () => {
		test("creates checkin with default values", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: { id2etag: {} },
			});

			const result = await habitCheckinExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.HABIT_CHECKINS_BATCH);
		});

		test("sends checkin in add array", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
				update: unknown[];
				delete: unknown[];
			};
			expect(body.add).toHaveLength(1);
			expect(body.update).toEqual([]);
			expect(body.delete).toEqual([]);
		});

		test("includes habit ID and value in checkin", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit456",
					value: 5,
					checkinDate: "",
					goal: 10,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
			};
			expect(body.add[0].habitId).toBe("habit456");
			expect(body.add[0].value).toBe(5);
			expect(body.add[0].goal).toBe(10);
		});

		test("generates unique checkin ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
			};
			expect(body.add[0].id).toBeDefined();
			expect(typeof body.add[0].id).toBe("string");
		});

		test("formats checkin date correctly", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "2024-03-15T10:00:00Z",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
			};
			expect(body.add[0].checkinStamp).toBe(20240315);
		});

		test("uses current date when checkinDate is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
			};
			expect(typeof body.add[0].checkinStamp).toBe("number");
			expect(body.add[0].checkinStamp).toBeGreaterThan(20200101);
		});

		test("includes checkin status as completed", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
			};
			expect(body.add[0].status).toBe(2);
		});

		test("throws error when habit ID is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			await expect(
				habitCheckinExecute.call(mockContext as any, 0),
			).rejects.toThrow("Habit ID is required");
		});

		test("includes timestamps in checkin", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					habitId: "habit123",
					value: 1,
					checkinDate: "",
					goal: 1,
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.HABIT_CHECKINS_BATCH,
				response: {},
			});

			await habitCheckinExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.HABIT_CHECKINS_BATCH)
			);
			const body = batchCall?.body as {
				add: Array<Record<string, unknown>>;
			};
			expect(body.add[0].checkinTime).toBeDefined();
			expect(body.add[0].opTime).toBeDefined();
		});
	});
});
