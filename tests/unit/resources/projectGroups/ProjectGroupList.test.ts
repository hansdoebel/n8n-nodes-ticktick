import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockProjectGroupsResponse } from "../../__mocks__/apiResponses";
import { projectGroupListExecute } from "../../../../nodes/TickTick/resources/projectGroups/operations/ProjectGroupList";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectGroupList Operation", () => {
	describe("projectGroupListExecute", () => {
		test("returns all project groups from sync endpoint", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: { projectGroups: mockProjectGroupsResponse },
			});

			const result = await projectGroupListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(2);
			expectApiCalled(mockContext, "GET", "/batch/check");
		});

		test("maps each project group to json output", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: { projectGroups: mockProjectGroupsResponse },
			});

			const result = await projectGroupListExecute.call(mockContext as any, 0);

			expect(result[0].json).toEqual({
				id: "group123",
				name: "Work Projects",
				sortOrder: 0,
			});
			expect(result[1].json).toEqual({
				id: "group456",
				name: "Personal Projects",
				sortOrder: 1,
			});
		});

		test("returns empty array when no project groups exist", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: { projectGroups: [] },
			});

			const result = await projectGroupListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});

		test("handles missing projectGroups property gracefully", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: {},
			});

			const result = await projectGroupListExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(0);
		});
	});
});
