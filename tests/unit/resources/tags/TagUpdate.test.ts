import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { tagUpdateExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagUpdate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagUpdate Operation", () => {
	describe("tagUpdateExecute", () => {
		test("updates tag with new label", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "work" },
					updateFields: {
						label: "Work Tasks",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: { success: true },
			});

			const result = await tagUpdateExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.TAGS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].name).toBe("work");
			expect(body.update[0].label).toBe("Work Tasks");
			expect(body.update[0].rawName).toBe("work");
		});

		test("updates tag with color", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "name", value: "personal" },
					updateFields: {
						label: "Personal",
						color: "#00FF00",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].color).toBe("#00FF00");
		});

		test("updates tag with parent", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "subtag" },
					updateFields: {
						label: "Subtag",
						parent: "work",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].parent).toBe("work");
		});

		test("updates tag with sort order and type", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "priority" },
					updateFields: {
						label: "Priority",
						sortOrder: 5,
						sortType: "MANUAL",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].sortOrder).toBe(5);
			expect(body.update[0].sortType).toBe("MANUAL");
		});

		test("excludes sortType when set to NONE", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "work" },
					updateFields: {
						label: "Work",
						sortType: "NONE",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].sortType).toBeUndefined();
		});

		test("handles string tagName parameter", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: "directtag",
					updateFields: {
						label: "Direct Tag",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].name).toBe("directtag");
		});

		test("throws error when label is missing", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "work" },
					updateFields: {
						color: "#FF0000",
					},
				},
			});

			await expect(tagUpdateExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Tag label is required for update",
				);
		});
	});
});
