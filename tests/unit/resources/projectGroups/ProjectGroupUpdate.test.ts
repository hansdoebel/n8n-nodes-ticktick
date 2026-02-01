import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { projectGroupUpdateExecute } from "../../../../nodes/TickTick/resources/projectGroups/operations/ProjectGroupUpdate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectGroupUpdate Operation", () => {
	describe("projectGroupUpdateExecute", () => {
		test("updates project group name", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group123",
					updateFields: {
						name: "Updated Name",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: { id2etag: {} },
			});

			const result = await projectGroupUpdateExecute.call(
				mockContext as any,
				0,
			);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.PROJECT_GROUPS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].id).toBe("group123");
			expect(body.update[0].name).toBe("Updated Name");
		});

		test("updates project group sort order", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group456",
					updateFields: {
						sortOrder: 10,
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: {},
			});

			await projectGroupUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].sortOrder).toBe(10);
		});

		test("updates multiple fields at once", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group789",
					updateFields: {
						name: "New Name",
						sortOrder: 5,
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: {},
			});

			await projectGroupUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].name).toBe("New Name");
			expect(body.update[0].sortOrder).toBe(5);
		});

		test("includes only id when no update fields provided", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group123",
					updateFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: {},
			});

			await projectGroupUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].id).toBe("group123");
		});
	});
});
