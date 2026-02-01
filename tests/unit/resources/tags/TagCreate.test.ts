import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { tagCreateExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagCreate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagCreate Operation", () => {
	describe("tagCreateExecute", () => {
		test("creates tag with name only", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Work",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: { success: true },
			});

			const result = await tagCreateExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "POST", ENDPOINTS.TAGS_BATCH);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].name).toBe("work");
			expect(body.add[0].label).toBe("Work");
		});

		test("normalizes tag name to lowercase without spaces", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "My New Tag",
					additionalFields: {},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].name).toBe("mynewtag");
			expect(body.add[0].label).toBe("My New Tag");
		});

		test("creates tag with color and parent", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					name: "Subtag",
					additionalFields: {
						color: "#FF0000",
						parent: "work",
					},
				},
			});

			mockContext._addApiHandler({
				method: "POST",
				endpoint: ENDPOINTS.TAGS_BATCH,
				response: {},
			});

			await tagCreateExecute.call(mockContext as any, 0);

			const calls = mockContext._getApiCalls();
			const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TAGS_BATCH));
			const body = batchCall?.body as { add: Array<Record<string, unknown>> };
			expect(body.add[0].color).toBe("#FF0000");
			expect(body.add[0].parent).toBe("work");
		});

		test("throws error when name is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				nodeParameters: {
					name: "",
					additionalFields: {},
				},
			});

			await expect(tagCreateExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Tag name is required",
				);
		});

		test("throws error when name is whitespace", async () => {
			const mockContext = createMockExecuteFunctions({
				nodeParameters: {
					name: "   ",
					additionalFields: {},
				},
			});

			await expect(tagCreateExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Tag name is required",
				);
		});
	});
});
