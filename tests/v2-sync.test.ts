import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createTestClient, type TickTickTestClient } from "./utils/testClient";

describe("TickTick V2 Sync Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /batch/check/0 - sync all data (V2 API)", async () => {
		const response = await client.get("/batch/check/0");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");

		// Verify sync data structure
		expect(response.data).toHaveProperty("projectProfiles");
		expect(response.data).toHaveProperty("syncTaskBean");
		expect(response.data).toHaveProperty("tags");
		expect(response.data).toHaveProperty("inboxId");

		console.log("✓ Sync endpoint returned comprehensive data");
	}, 10000);

	test("Extract project data from sync response", async () => {
		const response = await client.get("/batch/check/0");

		expect(response.statusCode).toBe(200);

		// Extract projects from sync data
		const projects = response.data.projectProfiles || [];
		expect(Array.isArray(projects)).toBe(true);

		if (projects.length > 0) {
			const firstProject = projects[0];
			expect(firstProject).toHaveProperty("id");
			expect(firstProject).toHaveProperty("name");

			console.log(
				`✓ Successfully extracted ${projects.length} projects from sync data`,
			);
			console.log(
				`  Example project: "${firstProject.name}" (${firstProject.id})`,
			);
		} else {
			console.log("⚠ No projects found in sync data");
		}
	}, 10000);

	test("Extract tasks from sync response", async () => {
		const response = await client.get("/batch/check/0");

		expect(response.statusCode).toBe(200);

		// Extract tasks from sync data
		const tasks = response.data.syncTaskBean?.update || [];
		expect(Array.isArray(tasks)).toBe(true);

		if (tasks.length > 0) {
			const firstTask = tasks[0];
			expect(firstTask).toHaveProperty("id");
			expect(firstTask).toHaveProperty("title");
			expect(firstTask).toHaveProperty("projectId");

			console.log(
				`✓ Successfully extracted ${tasks.length} tasks from sync data`,
			);
			console.log(
				`  Example task: "${firstTask.title}" in project ${firstTask.projectId}`,
			);
		} else {
			console.log("⚠ No tasks found in sync data");
		}
	}, 10000);

	test("Filter tasks by project ID from sync response", async () => {
		const response = await client.get("/batch/check/0");

		expect(response.statusCode).toBe(200);

		const projects = response.data.projectProfiles || [];
		const tasks = response.data.syncTaskBean?.update || [];

		if (projects.length > 0 && tasks.length > 0) {
			// Get first project ID
			const targetProjectId = projects[0].id;
			const projectName = projects[0].name;

			// Filter tasks for this project
			const projectTasks = tasks.filter(
				(task: any) => task.projectId === targetProjectId,
			);

			console.log(
				`✓ Found ${projectTasks.length} tasks in project "${projectName}"`,
			);

			if (projectTasks.length > 0) {
				expect(projectTasks[0]).toHaveProperty("title");
				console.log(`  First task: "${projectTasks[0].title}"`);
			}
		} else {
			console.log("⚠ Not enough data to test project filtering");
		}
	}, 10000);
});
