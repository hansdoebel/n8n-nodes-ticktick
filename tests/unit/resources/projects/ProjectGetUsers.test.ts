import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockSyncResponse } from "../../__mocks__/apiResponses";
import { projectGetUsersExecute } from "../../../../nodes/TickTick/resources/projects/operations/ProjectGetUsers";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("ProjectGetUsers Operation", () => {
	describe("projectGetUsersExecute", () => {
		test("retrieves users from shared project", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "sharedProject" },
				},
			});

			const syncWithSharedProject = {
				...mockSyncResponse,
				projectProfiles: [
					{
						id: "sharedProject",
						name: "Shared Project",
						userCount: 3,
					},
				],
			};

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: syncWithSharedProject,
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_USERS("sharedProject"),
				response: [
					{ userId: "user1", name: "User 1" },
					{ userId: "user2", name: "User 2" },
				],
			});

			const result = await projectGetUsersExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
			expectApiCalled(mockContext, "GET", ENDPOINTS.PROJECT_USERS("sharedProject"));
		});

		test("throws error when projectId is empty", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "" },
				},
			});

			await expect(projectGetUsersExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Project ID is required",
				);
		});

		test("throws error for inbox project", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "inbox123" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: {
					...mockSyncResponse,
					inboxId: "inbox123",
				},
			});

			await expect(projectGetUsersExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"Cannot get users from Inbox",
				);
		});

		test("throws error for non-shared project", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "project456" },
				},
			});

			const syncWithNonSharedProject = {
				...mockSyncResponse,
				projectProfiles: [
					{
						id: "project456",
						name: "Personal Project",
						userCount: 1,
					},
				],
			};

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: syncWithNonSharedProject,
			});

			await expect(projectGetUsersExecute.call(mockContext as any, 0)).rejects
				.toThrow(
					"not shared with other users",
				);
		});

		test("handles string projectId", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: "sharedProject",
				},
			});

			const syncWithSharedProject = {
				...mockSyncResponse,
				projectProfiles: [
					{
						id: "sharedProject",
						name: "Shared Project",
						userCount: 2,
					},
				],
			};

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: syncWithSharedProject,
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_USERS("sharedProject"),
				response: [],
			});

			const result = await projectGetUsersExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
		});

		test("handles project not found in sync (proceeds to API call)", async () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
				nodeParameters: {
					projectId: { mode: "id", value: "unknownProject" },
				},
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.SYNC,
				response: mockSyncResponse,
			});

			mockContext._addApiHandler({
				method: "GET",
				endpoint: ENDPOINTS.PROJECT_USERS("unknownProject"),
				response: [],
			});

			const result = await projectGetUsersExecute.call(mockContext as any, 0);

			expect(result).toHaveLength(1);
		});
	});
});
