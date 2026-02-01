import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { tagUpdateExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagUpdate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagUpdate Operation", () => {
	describe("tagUpdateExecute", () => {
		test("renames tag using rename endpoint", async () => {
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
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: {},
			});

			const result = await tagUpdateExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "PUT", ENDPOINTS.TAG_RENAME);

			const calls = mockContext._getApiCalls();
			const renameCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAG_RENAME)
			);
			const body = renameCall?.body as { name: string; newName: string };
			expect(body.name).toBe("work");
			expect(body.newName).toBe("Work Tasks");

			expect(result[0].json).toEqual({
				success: true,
				originalName: "work",
				newName: "Work Tasks",
			});
		});

		test("updates tag with color only", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "name", value: "personal" },
					updateFields: {
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
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].color).toBe("#00FF00");
			expect(body.update[0].name).toBe("personal");
		});

		test("updates tag with parent using resourceLocator", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "subtag" },
					updateFields: {
						parent: { mode: "list", value: "work" },
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
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].parent).toBe("work");
		});

		test("updates tag with parent using string value", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "subtag" },
					updateFields: {
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
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
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
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
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
						color: "#FF0000",
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
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
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
						color: "#0000FF",
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
			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
			const body = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(body.update[0].name).toBe("directtag");
		});

		test("renames and updates other fields in sequence", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "oldname" },
					updateFields: {
						label: "New Name",
						color: "#FF0000",
					},
				},
			});

			mockContext._addApiHandler({
				method: "PUT",
				endpoint: ENDPOINTS.TAG_RENAME,
				response: {},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: { updated: true },
			});

			const result = await tagUpdateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			expect(calls).toHaveLength(2);

			const renameCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAG_RENAME)
			);
			expect(renameCall?.body).toEqual({
				name: "oldname",
				newName: "New Name",
			});

			const batchCall = calls.find((c) =>
				c.endpoint.includes(ENDPOINTS.TAGS_BATCH)
			);
			const batchBody = batchCall?.body as {
				update: Array<Record<string, unknown>>;
			};
			expect(batchBody.update[0].name).toBe("New Name");
			expect(batchBody.update[0].color).toBe("#FF0000");

			expect(result[0].json).toMatchObject({
				originalName: "oldname",
				renamed: true,
				newName: "New Name",
			});
		});

		test("throws error when no update fields provided", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					tagName: { mode: "list", value: "work" },
					updateFields: {},
				},
			});

			await expect(tagUpdateExecute.call(mockContext as any, 0)).rejects
				.toThrow("At least one update field must be provided.");
		});
	});
});
