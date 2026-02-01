import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockProjectBatchResponse } from "../../__mocks__/apiResponses";
import { projectDeleteExecute } from "../../../../nodes/TickTick/resources/projects/operations/ProjectDelete";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectDelete Operation", () => {
	describe("projectDeleteExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("deletes project successfully", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: {},
				});

				const result = await projectDeleteExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.success).toBe(true);
				expect(result[0].json.operation).toBe("delete");
				expect(result[0].json.projectId).toBe("project456");
				expectApiCalled(mockContext, "DELETE", ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"));
			});

			test("throws error when projectId is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						projectId: { mode: "id", value: "" },
					},
				});

				await expect(projectDeleteExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Project ID is required",
					);
			});
		});

		describe("V2 API (Session)", () => {
			test("deletes project via batch endpoint", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						projectId: { mode: "id", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.PROJECTS_BATCH,
					response: mockProjectBatchResponse,
				});

				const result = await projectDeleteExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.success).toBe(true);
				expectApiCalled(mockContext, "POST", ENDPOINTS.PROJECTS_BATCH);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) =>
					c.endpoint.includes(ENDPOINTS.PROJECTS_BATCH)
				);
				const body = batchCall?.body as { delete: string[] };
				expect(body.delete).toContain("project456");
			});
		});

		describe("Resource Locator Handling", () => {
			test("extracts projectId from resource locator object", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: { mode: "list", value: "project456" },
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: {},
				});

				const result = await projectDeleteExecute.call(mockContext as any, 0);

				expect(result[0].json.projectId).toBe("project456");
			});

			test("handles string projectId directly", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						projectId: "project456",
					},
				});

				mockContext._addApiHandler({
					method: "DELETE",
					endpoint: ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456"),
					response: {},
				});

				const result = await projectDeleteExecute.call(mockContext as any, 0);

				expect(result[0].json.projectId).toBe("project456");
			});
		});
	});
});
