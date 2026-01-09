import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	createTestClient,
	type TickTickTestClient,
	uniqueName,
} from "./utils/testClient";
import { ENDPOINTS } from "./utils/endpoints";

describe("TickTick V2 Tasks Resource", () => {
	let client: TickTickTestClient;
	let inboxId: string;

	beforeAll(async () => {
		client = await createTestClient();
		inboxId = client.auth.inboxId;
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /project/all/trash/pagination - list deleted tasks", async () => {
		const response = await client.get(
			ENDPOINTS.PROJECT_ALL_TRASH_PAGINATION + "?start=0&limit=50",
		);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);

	test("GET /batch/check/0 - list all tasks from sync", async () => {
		const response = await client.get(ENDPOINTS.SYNC);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
		expect(response.data?.syncTaskBean).toBeDefined();
	}, 10000);

	test("Task create/update/complete/delete flow", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const taskTitle = uniqueName("TestTask");
		const taskId = generateId(24);

		const createBody = {
			add: [
				{
					id: taskId,
					projectId: inboxId,
					title: taskTitle,
					status: 0,
					sortOrder: 0,
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(ENDPOINTS.TASKS_BATCH, createBody);
		expect(createResponse.statusCode).toBe(200);
		expect(createResponse.data).toBeDefined();

		const updatedTitle = `${taskTitle}_Updated`;
		const updateBody = {
			add: [],
			update: [
				{
					id: taskId,
					projectId: inboxId,
					title: updatedTitle,
					status: 0,
					sortOrder: 0,
				},
			],
			delete: [],
		};

		const updateResponse = await client.post(ENDPOINTS.TASKS_BATCH, updateBody);
		expect(updateResponse.statusCode).toBe(200);

		const completeBody = {
			add: [],
			update: [
				{
					id: taskId,
					projectId: inboxId,
					title: updatedTitle,
					status: 2,
					sortOrder: 0,
				},
			],
			delete: [],
		};

		const completeResponse = await client.post(ENDPOINTS.TASKS_BATCH, completeBody);
		expect(completeResponse.statusCode).toBe(200);

		const deleteBody = {
			add: [],
			update: [],
			delete: [
				{
					taskId: taskId,
					projectId: inboxId,
				},
			],
		};

		const deleteResponse = await client.post(ENDPOINTS.TASKS_BATCH, deleteBody);
		expect(deleteResponse.statusCode).toBe(200);
	}, 30000);

	test("GET /project/all/completed - list completed tasks", async () => {
		const response = await client.get(
			ENDPOINTS.PROJECT_ALL_COMPLETED + "?from=&to=&limit=50",
		);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data) || typeof response.data === "object")
			.toBe(true);
	}, 10000);

	test("GET /project/all/closed - list closed projects", async () => {
		const response = await client.get(ENDPOINTS.PROJECT_ALL_CLOSED);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data) || typeof response.data === "object")
			.toBe(true);
	}, 10000);
});
