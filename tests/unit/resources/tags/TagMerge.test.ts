import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { tagMergeExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagMerge";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagMerge Operation", () => {
	describe("tagMergeExecute", () => {
		test("merges source tag into target tag", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					sourceTag: { mode: "list", value: "oldtag" },
					targetTag: { mode: "list", value: "newtag" },
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_MERGE,
				response: { success: true },
			});

			const result = await tagMergeExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.success).toBe(true);
			expect(result[0].json.sourceTag).toBe("oldtag");
			expect(result[0].json.targetTag).toBe("newtag");
			expectApiCalled(mockContext, "PUT", ENDPOINTS.TAG_MERGE);
		});

		test("sends correct body with name and newName", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					sourceTag: { mode: "name", value: "duplicate" },
					targetTag: { mode: "name", value: "primary" },
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_MERGE,
				response: {},
			});

			await tagMergeExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const mergeCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAG_MERGE));
			expect(mergeCall?.body).toEqual({
				name: "duplicate",
				newName: "primary",
			});
		});

		test("handles string sourceTag parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					sourceTag: "directsource",
					targetTag: { mode: "list", value: "target" },
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_MERGE,
				response: {},
			});

			const result = await tagMergeExecute.call(mockContext as any, 0);

			expect(result[0].json.sourceTag).toBe("directsource");
		});

		test("handles string targetTag parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					sourceTag: { mode: "list", value: "source" },
					targetTag: "directtarget",
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_MERGE,
				response: {},
			});

			const result = await tagMergeExecute.call(mockContext as any, 0);

			expect(result[0].json.targetTag).toBe("directtarget");
		});

		test("includes API response in output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					sourceTag: { mode: "list", value: "tobedeleted" },
					targetTag: { mode: "list", value: "remaining" },
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_MERGE,
				response: { merged: true, tasksMoved: 25 },
			});

			const result = await tagMergeExecute.call(mockContext as any, 0);

			expect(result[0].json.success).toBe(true);
			expect(result[0].json.merged).toBe(true);
			expect(result[0].json.tasksMoved).toBe(25);
		});

		test("handles empty values gracefully", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					sourceTag: { mode: "list", value: "" },
					targetTag: { mode: "list", value: "" },
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_MERGE,
				response: {},
			});

			const result = await tagMergeExecute.call(mockContext as any, 0);

			expect(result[0].json.sourceTag).toBe("");
			expect(result[0].json.targetTag).toBe("");
		});
	});
});
