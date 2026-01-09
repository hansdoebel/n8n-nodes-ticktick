import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createTestClient, type TickTickTestClient } from "./utils/testClient";
import { ENDPOINTS } from "./utils/endpoints";

describe("TickTick V2 Focus Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /pomodoros/statistics/heatmap - get focus heatmap", async () => {
		const today = new Date();
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(today.getDate() - 30);

		const formatDate = (date: Date): string => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}${month}${day}`;
		};

		const start = formatDate(thirtyDaysAgo);
		const end = formatDate(today);

		const response = await client.get(ENDPOINTS.FOCUS_HEATMAP(start, end));

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data)).toBe(true);
	}, 10000);

	test("GET /pomodoros/statistics/dist - get focus distribution", async () => {
		const today = new Date();
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(today.getDate() - 30);

		const formatDate = (date: Date): string => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}${month}${day}`;
		};

		const start = formatDate(thirtyDaysAgo);
		const end = formatDate(today);

		const response = await client.get(ENDPOINTS.FOCUS_DISTRIBUTION(start, end));

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);

	test(
		"GET /pomodoros/statistics/heatmap - handles date range validation",
		async () => {
			const response = await client.get(
				ENDPOINTS.FOCUS_HEATMAP("20240101", "20241231"),
			);

			expect(response.statusCode).toBe(200);
			expect(response.data).toBeDefined();
			expect(Array.isArray(response.data)).toBe(true);
		},
		10000,
	);

	test(
		"GET /pomodoros/statistics/dist - handles date range validation",
		async () => {
			const response = await client.get(
				ENDPOINTS.FOCUS_DISTRIBUTION("20240101", "20241231"),
			);

			expect(response.statusCode).toBe(200);
			expect(response.data).toBeDefined();
			expect(typeof response.data).toBe("object");
		},
		10000,
	);
});
