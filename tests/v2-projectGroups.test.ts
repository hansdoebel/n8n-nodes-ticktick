import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	createTestClient,
	type TickTickTestClient,
	uniqueName,
} from "./utils/testClient";
import { ENDPOINTS } from "./utils/endpoints";

describe("TickTick V2 ProjectGroups Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /batch/check/0 - list all project groups via sync", async () => {
		const response = await client.get(ENDPOINTS.SYNC);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
		expect(response.data?.projectGroups).toBeDefined();
	}, 10000);

	test("ProjectGroup create/update/delete flow", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const groupName = uniqueName("TestProjectGroup");
		const groupId = generateId(24);

		const createBody = {
			add: [
				{
					id: groupId,
					name: groupName,
					sortOrder: 0,
					sortType: "project",
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(
			ENDPOINTS.PROJECT_GROUPS_BATCH,
			createBody,
		);
		expect(createResponse.statusCode).toBe(200);
		expect(createResponse.data).toBeDefined();

		const updatedName = `${groupName}_Updated`;
		const updateBody = {
			add: [],
			update: [
				{
					id: groupId,
					name: updatedName,
					sortOrder: 0,
					sortType: "project",
				},
			],
			delete: [],
		};

		const updateResponse = await client.post(
			ENDPOINTS.PROJECT_GROUPS_BATCH,
			updateBody,
		);
		expect(updateResponse.statusCode).toBe(200);

		const deleteBody = {
			add: [],
			update: [],
			delete: [groupId],
		};

		const deleteResponse = await client.post(
			ENDPOINTS.PROJECT_GROUPS_BATCH,
			deleteBody,
		);
		expect(deleteResponse.statusCode).toBe(200);
	}, 30000);

	test("ProjectGroup with sortType options", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const groupName = uniqueName("TestProjectGroup");
		const groupId = generateId(24);

		const createBody = {
			add: [
				{
					id: groupId,
					name: groupName,
					sortOrder: 0,
					sortType: "sortOrder",
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(
			ENDPOINTS.PROJECT_GROUPS_BATCH,
			createBody,
		);
		expect(createResponse.statusCode).toBe(200);

		const deleteBody = {
			add: [],
			update: [],
			delete: [groupId],
		};

		await client.post(ENDPOINTS.PROJECT_GROUPS_BATCH, deleteBody);
	}, 30000);
});
