import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { tagDeleteExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagDelete";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagDelete Operation", () => {
	describe("tagDeleteExecute", () => {
		test("deletes tag by name from list", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "work" },
				},
			});

			mockContext._addApiHandler({
				method: "DELETE",
				endpoint: ENDPOINTS.TAG,
				response: {},
			});

			const result = await tagDeleteExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.deletedTag).toBe("work");
			expectApiCalled(mockContext, "DELETE", ENDPOINTS.TAG);
		});

		test("passes tag name as query parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "name", value: "personal" },
				},
			});

			mockContext._addApiHandler({
				method: "DELETE",
				endpoint: ENDPOINTS.TAG,
				response: {},
			});

			await tagDeleteExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const deleteCall = calls.find((c) => c.method === "DELETE");
			expect(deleteCall?.qs).toEqual({ name: "personal" });
		});

		test("handles string tagName parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: "directtag",
				},
			});

			mockContext._addApiHandler({
				method: "DELETE",
				endpoint: ENDPOINTS.TAG,
				response: {},
			});

			const result = await tagDeleteExecute.call(mockContext as any, 0);

			expect(result[0].json.deletedTag).toBe("directtag");
		});

		test("includes API response in output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "archived" },
				},
			});

			mockContext._addApiHandler({
				method: "DELETE",
				endpoint: ENDPOINTS.TAG,
				response: { message: "Tag deleted", taskCount: 5 },
			});

			const result = await tagDeleteExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.deletedTag).toBe("archived");
			expect(result[0].json.message).toBe("Tag deleted");
			expect(result[0].json.taskCount).toBe(5);
		});

		test("handles empty value gracefully", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "" },
				},
			});

			mockContext._addApiHandler({
				method: "DELETE",
				endpoint: ENDPOINTS.TAG,
				response: {},
			});

			const result = await tagDeleteExecute.call(mockContext as any, 0);

			expect(result[0].json.deletedTag).toBe("");
		});
	});
});
