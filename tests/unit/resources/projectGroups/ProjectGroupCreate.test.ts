import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { projectGroupCreateExecute } from "../../../../nodes/TickTick/resources/projectGroups/operations/ProjectGroupCreate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectGroupCreate Operation", () => {
	describe("projectGroupCreateExecute", () => {
		test("creates project group with name", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Work Projects",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: { id2etag: {} },
			});

			const result = await projectGroupCreateExecute.call(
				mockContext as any,
				0,
			);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.PROJECT_GROUPS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].name).toBe("Work Projects");
		});

		test("creates project group with sort order", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Personal",
					additionalFields: {
						sortOrder: 5,
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: {},
			});

			await projectGroupCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].sortOrder).toBe(5);
		});

		test("uses default sort order of 0", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Test Group",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: {},
			});

			await projectGroupCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].sortOrder).toBe(0);
		});

		test("throws error when name is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "",
					additionalFields: {},
				},
			});

			await expect(
				projectGroupCreateExecute.call(mockContext as any, 0),
			).rejects.toThrow("Project group name is required and cannot be empty");
		});

		test("throws error when name is whitespace", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "   ",
					additionalFields: {},
				},
			});

			await expect(
				projectGroupCreateExecute.call(mockContext as any, 0),
			).rejects.toThrow("Project group name is required and cannot be empty");
		});
	});
});
