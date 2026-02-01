import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { tagRenameExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagRename";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagRename Operation", () => {
	describe("tagRenameExecute", () => {
		test("renames tag from list selection", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					oldName: { mode: "list", value: "work" },
					newName: "projects",
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: { success: true },
			});

			const result = await tagRenameExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.oldName).toBe("work");
			expect(result[0].json.newName).toBe("projects");
			expectApiCalled(mockContext, "PUT", ENDPOINTS.TAG_RENAME);
		});

		test("sends correct body with name and newName", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					oldName: { mode: "name", value: "personal" },
					newName: "home",
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: {},
			});

			await tagRenameExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const renameCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAG_RENAME));
			expect(renameCall?.body).toEqual({
				name: "personal",
				newName: "home",
			});
		});

		test("handles string oldName parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					oldName: "directtag",
					newName: "renamedtag",
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: {},
			});

			const result = await tagRenameExecute.call(mockContext as any, 0);

			expect(result[0].json.oldName).toBe("directtag");
			expect(result[0].json.newName).toBe("renamedtag");
		});

		test("includes API response in output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					oldName: { mode: "list", value: "old" },
					newName: "new",
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: { updated: true, tasksAffected: 10 },
			});

			const result = await tagRenameExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.updated).toBe(true);
			expect(result[0].json.tasksAffected).toBe(10);
		});

		test("handles empty oldName value", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					oldName: { mode: "list", value: "" },
					newName: "newtag",
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: {},
			});

			const result = await tagRenameExecute.call(mockContext as any, 0);

			expect(result[0].json.oldName).toBe("");
		});
	});
});
