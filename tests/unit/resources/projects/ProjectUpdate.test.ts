import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockProjectBatchResponse } from "../../__mocks__/apiResponses";
import { sampleProject } from "../../__mocks__/fixtures/projects";
import { projectUpdateExecute } from "../../../../nodes/TickTick/resources/projects/operations/ProjectUpdate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectUpdate Operation", () => {
	describe("projectUpdateExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("updates project name", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							name: "Updated Name",
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: { ...sampleProject, name: "Updated Name" },
				});

				const result = await projectUpdateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(
					mockContext,
					"POST",
					ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
				);
			});

			test("updates multiple fields", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							name: "New Name",
							color: "#FF0000",
							viewMode: "kanban",
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: sampleProject,
				});

				await projectUpdateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.name).toBe("New Name");
				expect(body.color).toBe("#FF0000");
				expect(body.viewMode).toBe("kanban");
			});

			test("throws error when projectId is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						projectId: { mode: "id", value: "" },
						jsonParameters: false,
						updateFields: { name: "Test" },
					},
				});

				await expect(projectUpdateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Project ID is required",
					);
			});
		});

		describe("V2 API (Session)", () => {
			test("updates project via batch endpoint", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							name: "V2 Updated",
						},
					},
				});

				// Mock the sync endpoint that fetches current project data
				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: {
						projectProfiles: [
							{ id: "project456", name: "Old Name", color: "#FF0000" },
						],
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.PROJECTS_BATCH,
					response: mockProjectBatchResponse,
				});

				const result = await projectUpdateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(mockContext, "POST", ENDPOINTS.PROJECTS_BATCH);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) =>
					c.endpoint.includes(ENDPOINTS.PROJECTS_BATCH)
				);
				const body = batchCall?.body as {
					update: Array<Record<string, unknown>>;
				};
				expect(body.update[0].id).toBe("project456");
				expect(body.update[0].name).toBe("V2 Updated");
			});
		});

		describe("JSON Parameters Mode", () => {
			test("sends raw JSON body", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						jsonParameters: true,
						additionalFieldsJson: JSON.stringify({
							name: "JSON Updated",
							color: "#00FF00",
						}),
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: sampleProject,
				});

				await projectUpdateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				expect(postCall?.body).toMatchObject({
					name: "JSON Updated",
					color: "#00FF00",
				});
			});

			test("throws on invalid JSON", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						jsonParameters: true,
						additionalFieldsJson: "{ invalid }",
					},
				});

				await expect(projectUpdateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Invalid JSON",
					);
			});
		});

		describe("Edge Cases", () => {
			test("skips empty update fields in V2", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							name: "",
							color: null,
						},
					},
				});

				// Mock the sync endpoint that fetches current project data
				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: {
						projectProfiles: [
							{ id: "project456", name: "Existing Name", color: "#0000FF" },
						],
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.PROJECTS_BATCH,
					response: mockProjectBatchResponse,
				});

				await projectUpdateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) =>
					c.endpoint.includes(ENDPOINTS.PROJECTS_BATCH)
				);
				const body = batchCall?.body as {
					update: Array<Record<string, unknown>>;
				};
				// Empty string and null values should be skipped, but existing project data is merged
				expect(body.update[0].id).toBe("project456");
			});

			test("handles string projectId", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: "project456",
						jsonParameters: false,
						updateFields: { name: "Test" },
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: sampleProject,
				});

				const result = await projectUpdateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
			});
		});
	});
});
