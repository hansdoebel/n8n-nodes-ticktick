import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	createTestClient,
	type TickTickTestClient,
	uniqueName,
} from "./utils/testClient";
import { ENDPOINTS } from "./utils/endpoints";

describe("TickTick V2 Projects Resource", () => {
	let client: TickTickTestClient;
	let testProjectId: string;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /projects - list all projects (V2 endpoint)", async () => {
		const response = await client.get(ENDPOINTS.PROJECTS);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data) || typeof response.data === "object")
			.toBe(true);

		// Store a project ID for further tests
		if (Array.isArray(response.data) && response.data.length > 0) {
			testProjectId = response.data[0].id;
		}
	}, 10000);

	test(
		"V1 API endpoints are NOT compatible with V2 session auth - /open/v1/project/:projectId/data",
		async () => {
			// Skip if no projects found
			if (!testProjectId) {
				console.warn("Skipping test: no projects available");
				return;
			}

			// IMPORTANT FINDING: V1 endpoints (/open/v1/*) do NOT work with V2 session authentication
			// This test documents that V1 and V2 APIs are separate and incompatible
			// The ProjectGet operation will need to use different endpoints based on auth type
			const response = await client.request(
				"GET",
				`/open/v1/project/${testProjectId}/data`,
			);

			// V1 endpoints return 404 when using V2 session credentials
			expect(response.statusCode).toBe(404);

			console.log(
				"✓ Confirmed: V1 project data endpoint does not work with V2 session auth",
			);
		},
		10000,
	);

	test(
		"V1 API endpoints are NOT compatible with V2 session auth - /open/v1/project/inbox/data",
		async () => {
			// Test the inbox endpoint which is commonly used
			const response = await client.request(
				"GET",
				"/open/v1/project/inbox/data",
			);

			// V1 endpoints return 404 when using V2 session credentials
			expect(response.statusCode).toBe(404);

			console.log(
				"✓ Confirmed: V1 inbox endpoint does not work with V2 session auth",
			);
		},
		10000,
	);

	test(
		"V1 API endpoints are NOT compatible with V2 session auth - /open/v1/project/:projectId",
		async () => {
			// Skip if no projects found
			if (!testProjectId) {
				console.warn("Skipping test: no projects available");
				return;
			}

			// Test if V1 endpoint for getting a specific project works with V2 auth
			const response = await client.request(
				"GET",
				`/open/v1/project/${testProjectId}`,
			);

			// V1 endpoints return 404 when using V2 session credentials
			expect(response.statusCode).toBe(404);

			console.log(
				"✓ Confirmed: V1 get specific project endpoint does not work with V2 session auth",
			);
		},
		10000,
	);

	test(
		"V1 API endpoints are NOT compatible with V2 session auth - /open/v1/project",
		async () => {
			// Test if V1 endpoint for listing all projects works with V2 auth
			const response = await client.request("GET", ENDPOINTS.OPEN_V1_PROJECT);

			// V1 endpoints return 404 when using V2 session credentials
			expect(response.statusCode).toBe(404);

			console.log(
				"✓ Confirmed: V1 list projects endpoint does not work with V2 session auth",
			);
		},
		10000,
	);

	// Test V2 API equivalents for project operations
	test(
		"GET /project/:projectId/data - get project with data (V2 endpoint)",
		async () => {
			// Skip if no projects found
			if (!testProjectId) {
				console.warn("Skipping test: no projects available");
				return;
			}

			// Test V2 equivalent: /api/v2/project/:projectId/data
			const response = await client.request(
				"GET",
				`/project/${testProjectId}/data`,
			);

			console.log(
				`Testing V2 endpoint /project/${testProjectId}/data - Status: ${response.statusCode}`,
			);

			if (response.statusCode === 200) {
				expect(response.data).toBeDefined();
				expect(typeof response.data).toBe("object");

				// Verify the response contains expected project data structure
				if (response.data) {
					console.log("✓ V2 project data endpoint works!", response.data);
					expect(response.data).toHaveProperty("tasks");
					expect(Array.isArray(response.data.tasks)).toBe(true);
				}
			} else {
				console.log(
					`✗ V2 project data endpoint returned ${response.statusCode}`,
					response.data,
				);
			}
		},
		10000,
	);

	test(
		"GET /project/:projectId - get specific project (V2 endpoint)",
		async () => {
			// Skip if no projects found
			if (!testProjectId) {
				console.warn("Skipping test: no projects available");
				return;
			}

			// Test V2 equivalent: /api/v2/project/:projectId
			const response = await client.request("GET", `/project/${testProjectId}`);

			console.log(
				`Testing V2 endpoint /project/${testProjectId} - Status: ${response.statusCode}`,
			);

			if (response.statusCode === 200) {
				expect(response.data).toBeDefined();
				expect(typeof response.data).toBe("object");

				// Verify project structure
				if (response.data) {
					console.log(
						"✓ V2 get specific project endpoint works!",
						response.data,
					);
					expect(response.data).toHaveProperty("id");
					expect(response.data).toHaveProperty("name");
				}
			} else {
				console.log(
					`✗ V2 get specific project endpoint returned ${response.statusCode}`,
					response.data,
				);
			}
		},
		10000,
	);

	test(
		"GET /batch/check/0 - comprehensive data including projects",
		async () => {
			const response = await client.request("GET", ENDPOINTS.SYNC);

			console.log(
				`Testing V2 endpoint /batch/check/0 - Status: ${response.statusCode}`,
			);

			if (response.statusCode === 200) {
				expect(response.data).toBeDefined();
				expect(typeof response.data).toBe("object");

				if (response.data) {
					console.log(
						"✓ V2 batch/check endpoint works! Keys:",
						Object.keys(response.data),
					);

					if (response.data.projectProfiles) {
						console.log(
							"  - Found projectProfiles:",
							response.data.projectProfiles.length,
						);
					}
					if (response.data.syncTaskBean?.update) {
						console.log("  - Found tasks in syncTaskBean");
					}
				}
			} else {
				console.log(
					`✗ V2 batch/check endpoint returned ${response.statusCode}`,
					response.data,
				);
			}
		},
		10000,
	);

	test(
		"GET /project/:projectId/users - get project users (shared project only)",
		async () => {
			// Skip if no projects found
			if (!testProjectId) {
				console.warn("Skipping test: no projects available");
				return;
			}

			// Note: This endpoint only works for shared/collaborative projects
			// For non-shared projects, it will return an error
			const response = await client.request(
				"GET",
				`/project/${testProjectId}/users`,
			);

			console.log(
				`Testing V2 endpoint /project/${testProjectId}/users - Status: ${response.statusCode}`,
			);

			// For personal (non-shared) projects, the API returns 500 with "no_project_permission"
			// For shared projects, it returns 200 with an array of users
			if (response.statusCode === 200) {
				expect(Array.isArray(response.data)).toBe(true);
				if (Array.isArray(response.data) && response.data.length > 0) {
					const user = response.data[0];
					expect(user).toHaveProperty("userId");
					expect(user).toHaveProperty("username");
					console.log("✓ V2 project users endpoint works!", response.data);
				}
			} else {
				// Expected for non-shared projects
				console.log(
					"✓ V2 project users endpoint returned expected error for non-shared project",
					response.data,
				);
				expect(response.statusCode).toBe(500);
			}
		},
		10000,
	);

	test("Project create/update/delete flow", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const projectName = uniqueName("TestProject");
		const projectId = generateId(24);

		const createBody = {
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

		const createResponse = await client.post(
			ENDPOINTS.PROJECTS_BATCH,
			createBody,
		);
		expect(createResponse.statusCode).toBe(200);
		expect(createResponse.data).toBeDefined();

		const updatedName = `${projectName}_Updated`;
		const updateBody = {
			add: [],
			update: [
				{
					id: projectId,
					name: updatedName,
					color: "#3b82f6",
					sortOrder: 0,
					viewMode: "list",
				},
			],
			delete: [],
		};

		const updateResponse = await client.post(
			ENDPOINTS.PROJECTS_BATCH,
			updateBody,
		);
		expect(updateResponse.statusCode).toBe(200);

		const deleteBody = {
			add: [],
			update: [],
			delete: [projectId],
		};

		const deleteResponse = await client.post(
			ENDPOINTS.PROJECTS_BATCH,
			deleteBody,
		);
		expect(deleteResponse.statusCode).toBe(200);
	}, 30000);
});
