import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockSyncResponse } from "../../__mocks__/apiResponses";
import { sampleProject } from "../../__mocks__/fixtures/projects";
import { projectGetExecute } from "../../../../nodes/TickTick/resources/projects/operations/ProjectGet";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectGet Operation", () => {
	describe("projectGetExecute", () => {
		describe("V1 API - getAll mode", () => {
			test("retrieves all projects", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getAll",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT,
					response: [sampleProject],
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(mockContext, "GET", ENDPOINTS.OPEN_V1_PROJECT);
			});
		});

		describe("V1 API - getSpecific mode", () => {
			test("retrieves specific project by ID", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: { mode: "id", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: sampleProject,
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.id).toBe("project456");
			});

			test("throws error for inbox in getSpecific mode", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: { mode: "id", value: "" },
					},
				});

				await expect(projectGetExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Get Specific Project",
					);
			});
		});

		describe("V1 API - getWithData mode", () => {
			test("retrieves project with tasks", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getWithData",
						projectId: { mode: "id", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_DATA("project456"),
					response: { project: sampleProject, tasks: [] },
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(mockContext, "GET", "/project456/data");
			});

			test("uses inbox as default projectId for getWithData", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getWithData",
						projectId: "",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_DATA("inbox"),
					response: { project: { id: "inbox" }, tasks: [] },
				});

				await projectGetExecute.call(mockContext as any, 0);

				expectApiCalled(mockContext, "GET", "/inbox/data");
			});
		});

		describe("V2 API - getAll mode", () => {
			test("retrieves all projects from sync", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						mode: "getAll",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(Array.isArray(result[0].json)).toBe(true);
			});
		});

		describe("V2 API - getSpecific mode", () => {
			test("retrieves specific project from sync", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: { mode: "id", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.id).toBe("project456");
			});

			test("throws error when project not found in V2", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: { mode: "id", value: "nonexistent" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				await expect(projectGetExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Project with ID nonexistent not found",
					);
			});

			test("throws error for inbox in getSpecific mode V2", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: "",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				await expect(projectGetExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Get Specific Project",
					);
			});
		});

		describe("V2 API - getWithData mode", () => {
			test("retrieves project with filtered tasks", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						mode: "getWithData",
						projectId: { mode: "id", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.project).toBeDefined();
				expect(result[0].json.tasks).toBeDefined();
				expect(Array.isArray(result[0].json.tasks)).toBe(true);
			});
		});

		describe("Resource Locator Handling", () => {
			test("extracts projectId from resource locator object", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: { mode: "list", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: sampleProject,
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result[0].json.id).toBe("project456");
			});

			test("handles string projectId directly", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						mode: "getSpecific",
						projectId: "project456",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: sampleProject,
				});

				const result = await projectGetExecute.call(mockContext as any, 0);

				expect(result[0].json.id).toBe("project456");
			});
		});
	});
});
