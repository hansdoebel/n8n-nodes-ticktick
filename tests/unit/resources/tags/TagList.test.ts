import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import {
	mockSyncResponse,
	mockTagsResponse,
} from "../../__mocks__/apiResponses";
import { tagListExecute } from "../../../../nodes/TickTick/resources/tags/operations/TagList";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TagList Operation", () => {
	describe("tagListExecute", () => {
		test("returns all tags from sync endpoint", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockTagsResponse,
			});

			const result = await tagListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expectApiCalled(mockContext, "GET", "/batch/check");
		});

		test("maps each tag to json output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockTagsResponse,
			});

			const result = await tagListExecute.call(mockContext as any, 0);

			expect(result[0].json).toEqual({
				name: "work",
				label: "Work",
				color: "#F18181",
				sortOrder: 0,
			});
			expect(result[1].json).toEqual({
				name: "personal",
				label: "Personal",
				color: "#4A90D9",
				sortOrder: 1,
			});
		});

		test("returns empty array when no tags exist", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: { tags: [] },
			});

			const result = await tagListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});

		test("handles missing tags array gracefully", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: {},
			});

			const result = await tagListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});
	});
});
