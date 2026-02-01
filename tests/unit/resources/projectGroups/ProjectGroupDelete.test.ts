import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { projectGroupDeleteExecute } from "../../../../nodes/TickTick/resources/projectGroups/operations/ProjectGroupDelete";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectGroupDelete Operation", () => {
	describe("projectGroupDeleteExecute", () => {
		test("deletes project group by ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group123",
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: { id2etag: {} },
			});

			const result = await projectGroupDeleteExecute.call(
				mockContext as any,
				0,
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.deletedProjectGroupId).toBe("group123");
			expectApiCalled(mockContext, "POST", ENDPOINTS.PROJECT_GROUPS_BATCH);
		});

		test("sends delete array with project group ID", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group456",
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: {},
			});

			await projectGroupDeleteExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.PROJECT_GROUPS_BATCH)
			);
			const body = batchCall?.body as { delete: string[] };
			expect(body.delete).toEqual(["group456"]);
		});

		test("includes API response in output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectGroupId: "group789",
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.PROJECT_GROUPS_BATCH,
				response: { id2etag: { group789: "deleted" } },
			});

			const result = await projectGroupDeleteExecute.call(
				mockContext as any,
				0,
			);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.deletedProjectGroupId).toBe("group789");
			expect(result[0].json.id2etag).toEqual({ group789: "deleted" });
		});
	});
});
