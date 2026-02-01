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

		const completeResponse = await client.post(
			ENDPOINTS.TASKS_BATCH,
			completeBody,
		);
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

	test("Task get - retrieve single task by ID from sync", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const taskTitle = uniqueName("TestTaskGet");
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

		const syncResponse = await client.get(ENDPOINTS.SYNC);
		expect(syncResponse.statusCode).toBe(200);

		const tasks = (syncResponse.data as any)?.syncTaskBean?.update || [];
		const task = tasks.find((t: any) => t.id === taskId);

		expect(task).toBeDefined();
		expect(task.title).toBe(taskTitle);
		expect(task.projectId).toBe(inboxId);

		const deleteBody = {
			add: [],
			update: [],
			delete: [{ taskId, projectId: inboxId }],
		};
		await client.post(ENDPOINTS.TASKS_BATCH, deleteBody);
	}, 30000);

	test("Task move - move task between projects", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const projectName = uniqueName("TestProjectMove");
		const projectId = generateId(24);

		const createProjectBody = {
			add: [
				{
					id: projectId,
					name: projectName,
					color: "#3b82f6",
					sortOrder: 0,
					viewMode: "list",
				},
			],
			update: [],
			delete: [],
		};

		const createProjectResponse = await client.post(
			ENDPOINTS.PROJECTS_BATCH,
			createProjectBody,
		);
		expect(createProjectResponse.statusCode).toBe(200);

		const taskTitle = uniqueName("TestTaskMove");
		const taskId = generateId(24);

		const createTaskBody = {
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

		const createTaskResponse = await client.post(
			ENDPOINTS.TASKS_BATCH,
			createTaskBody,
		);
		expect(createTaskResponse.statusCode).toBe(200);

		const moveBody = [
			{
				taskId: taskId,
				fromProjectId: inboxId,
				toProjectId: projectId,
			},
		];

		const moveResponse = await client.post(ENDPOINTS.TASK_PROJECT, moveBody);
		expect(moveResponse.statusCode).toBe(200);

		const syncResponse = await client.get(ENDPOINTS.SYNC);
		const tasks = (syncResponse.data as any)?.syncTaskBean?.update || [];
		const movedTask = tasks.find((t: any) => t.id === taskId);

		expect(movedTask).toBeDefined();
		expect(movedTask.projectId).toBe(projectId);

		const deleteTaskBody = {
			add: [],
			update: [],
			delete: [{ taskId, projectId }],
		};
		await client.post(ENDPOINTS.TASKS_BATCH, deleteTaskBody);

		const deleteProjectBody = {
			add: [],
			update: [],
			delete: [projectId],
		};
		await client.post(ENDPOINTS.PROJECTS_BATCH, deleteProjectBody);
	}, 45000);

	test(
		"POST /task/assign - assign task to user (shared project only)",
		async () => {
			const generateId = (length: number = 24): string => {
				return Array.from(
					{ length },
					() => Math.floor(Math.random() * 16).toString(16),
				).join("");
			};

			const taskTitle = uniqueName("TestTaskAssign");
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

			const createResponse = await client.post(
				ENDPOINTS.TASKS_BATCH,
				createBody,
			);
			expect(createResponse.statusCode).toBe(200);

			const assignBody = [
				{
					assignee: "123456789",
					projectId: inboxId,
					taskId: taskId,
				},
			];

			const assignResponse = await client.post(
				ENDPOINTS.TASK_ASSIGN,
				assignBody,
			);

			console.log(
				`Testing V2 endpoint /task/assign - Status: ${assignResponse.statusCode}`,
			);

			if (assignResponse.statusCode === 200) {
				console.log("✓ V2 task assign endpoint works!", assignResponse.data);
			} else {
				console.log(
					"✓ V2 task assign endpoint returned expected error for non-shared project",
					assignResponse.data,
				);
				expect([400, 500]).toContain(assignResponse.statusCode);
			}

			const deleteBody = {
				add: [],
				update: [],
				delete: [{ taskId, projectId: inboxId }],
			};
			await client.post(ENDPOINTS.TASKS_BATCH, deleteBody);
		},
		30000,
	);

	test("Task update with tags", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const tagLabel = uniqueName("TaskTag");
		const tagName = tagLabel.toLowerCase().replace(/\s+/g, "");

		const createTagResponse = await client.post(ENDPOINTS.TAGS_BATCH, {
			add: [{ label: tagLabel, name: tagName }],
		});
		expect(createTagResponse.statusCode).toBe(200);

		const taskTitle = uniqueName("TestTaskWithTags");
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

		const updateBody = {
			add: [],
			update: [
				{
					id: taskId,
					projectId: inboxId,
					title: taskTitle,
					tags: [tagName],
					status: 0,
					sortOrder: 0,
				},
			],
			delete: [],
		};

		const updateResponse = await client.post(ENDPOINTS.TASKS_BATCH, updateBody);
		expect(updateResponse.statusCode).toBe(200);

		const syncResponse = await client.get(ENDPOINTS.SYNC);
		expect(syncResponse.statusCode).toBe(200);

		const tasks = (syncResponse.data as any)?.syncTaskBean?.update || [];
		const updatedTask = tasks.find((t: any) => t.id === taskId);

		expect(updatedTask).toBeDefined();
		expect(updatedTask.tags).toBeDefined();
		expect(updatedTask.tags).toContain(tagName);

		const deleteTaskBody = {
			add: [],
			update: [],
			delete: [{ taskId, projectId: inboxId }],
		};
		await client.post(ENDPOINTS.TASKS_BATCH, deleteTaskBody);

		await client.delete(`/tag?name=${encodeURIComponent(tagName)}`);
	}, 30000);

	test("Task setParent - set and unset parent task", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const parentTitle = uniqueName("ParentTask");
		const parentId = generateId(24);
		const childTitle = uniqueName("ChildTask");
		const childId = generateId(24);

		const createBody = {
			add: [
				{
					id: parentId,
					projectId: inboxId,
					title: parentTitle,
					status: 0,
					sortOrder: 0,
				},
				{
					id: childId,
					projectId: inboxId,
					title: childTitle,
					status: 0,
					sortOrder: 1,
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(ENDPOINTS.TASKS_BATCH, createBody);
		expect(createResponse.statusCode).toBe(200);

		const setParentBody = {
			add: [],
			update: [
				{
					id: childId,
					projectId: inboxId,
					title: childTitle,
					parentId: parentId,
					status: 0,
					sortOrder: 1,
				},
			],
			delete: [],
		};

		const setParentResponse = await client.post(
			ENDPOINTS.TASKS_BATCH,
			setParentBody,
		);
		expect(setParentResponse.statusCode).toBe(200);

		const unsetParentBody = {
			add: [],
			update: [
				{
					id: childId,
					projectId: inboxId,
					title: childTitle,
					parentId: "",
					status: 0,
					sortOrder: 1,
				},
			],
			delete: [],
		};

		const unsetParentResponse = await client.post(
			ENDPOINTS.TASKS_BATCH,
			unsetParentBody,
		);
		expect(unsetParentResponse.statusCode).toBe(200);

		const deleteBody = {
			add: [],
			update: [],
			delete: [
				{ taskId: childId, projectId: inboxId },
				{ taskId: parentId, projectId: inboxId },
			],
		};
		await client.post(ENDPOINTS.TASKS_BATCH, deleteBody);
	}, 45000);
});
