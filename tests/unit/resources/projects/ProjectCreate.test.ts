import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockProjectBatchResponse } from "../../__mocks__/apiResponses";
import { sampleProject } from "../../__mocks__/fixtures/projects";
import { projectCreateExecute } from "../../../../nodes/TickTick/resources/projects/operations/ProjectCreate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectCreate Operation", () => {
	describe("projectCreateExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("creates project with name only", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						name: "New Project",
						jsonParameters: false,
						additionalFields: {},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT,
					response: { ...sampleProject, name: "New Project" },
				});

				const result = await projectCreateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.name).toBe("New Project");
				expectApiCalled(mockContext, "POST", ENDPOINTS.OPEN_V1_PROJECT);
			});

			test("creates project with all additional fields", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						name: "Full Project",
						jsonParameters: false,
						additionalFields: {
							color: "#FF5733",
							kind: "TASK",
							sortOrder: 10,
							viewMode: "kanban",
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT,
					response: sampleProject,
				});

				await projectCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.name).toBe("Full Project");
				expect(body.color).toBe("#FF5733");
				expect(body.kind).toBe("TASK");
				expect(body.sortOrder).toBe(10);
				expect(body.viewMode).toBe("kanban");
			});

			test("throws error when name is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						name: "",
						jsonParameters: false,
						additionalFields: {},
					},
				});

				await expect(projectCreateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Project name is required",
					);
			});

			test("throws error when name is whitespace", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						name: "   ",
						jsonParameters: false,
						additionalFields: {},
					},
				});

				await expect(projectCreateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Project name is required",
					);
			});
		});

		describe("V2 API (Session)", () => {
			test("creates project via batch endpoint", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						name: "V2 Project",
						jsonParameters: false,
						additionalFields: {},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.PROJECTS_BATCH,
					response: mockProjectBatchResponse,
				});

				const result = await projectCreateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(mockContext, "POST", ENDPOINTS.PROJECTS_BATCH);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) =>
					c.endpoint.includes(ENDPOINTS.PROJECTS_BATCH)
				);
				const body = batchCall?.body as { add: Array<Record<string, unknown>> };
				expect(body.add).toHaveLength(1);
				expect(body.add[0].name).toBe("V2 Project");
			});
		});

		describe("JSON Parameters Mode", () => {
			test("sends raw JSON body", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						jsonParameters: true,
						additionalFieldsJson: JSON.stringify({
							name: "JSON Project",
							color: "#00FF00",
						}),
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT,
					response: sampleProject,
				});

				await projectCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				expect(postCall?.body).toMatchObject({
					name: "JSON Project",
					color: "#00FF00",
				});
			});

			test("throws on invalid JSON", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						jsonParameters: true,
						additionalFieldsJson: "{ invalid }",
					},
				});

				await expect(projectCreateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Invalid JSON",
					);
			});
		});

		describe("Edge Cases", () => {
			test("skips empty additional fields", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						name: "Project",
						jsonParameters: false,
						additionalFields: {
							color: "",
							sortOrder: null,
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT,
					response: sampleProject,
				});

				await projectCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.color).toBeUndefined();
				expect(body.sortOrder).toBeUndefined();
			});
		});
	});
});
