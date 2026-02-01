import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import {
	mockSyncResponse,
	mockTaskBatchResponse,
} from "../../__mocks__/apiResponses";
import { sampleTask, sampleTaskWithTags } from "../../__mocks__/fixtures/tasks";
import {
	applyClearFields,
	applyTagChanges,
	buildSubtask,
	buildTaskBody,
	extractResourceLocatorValue,
	extractTagValue,
	parseReminders,
	taskUpdateExecute,
} from "../../../../nodes/TickTick/resources/tasks/operations/TaskUpdate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskUpdate Operation", () => {
	describe("Helper Functions", () => {
		describe("extractResourceLocatorValue", () => {
			test("extracts value from object format", () => {
				const input = { mode: "list", value: "task123" };
				expect(extractResourceLocatorValue(input)).toBe("task123");
			});

			test("extracts value from id mode", () => {
				const input = { mode: "id", value: "abc123def456" };
				expect(extractResourceLocatorValue(input)).toBe("abc123def456");
			});

			test("returns string as-is", () => {
				expect(extractResourceLocatorValue("task123")).toBe("task123");
			});

			test("returns empty string for undefined", () => {
				expect(extractResourceLocatorValue(undefined)).toBe("");
			});

			test("returns empty string for null object value", () => {
				const input = { mode: "list", value: "" };
				expect(extractResourceLocatorValue(input)).toBe("");
			});

			test("handles object with undefined value", () => {
				const input = { mode: "list" } as { mode: string; value: string };
				expect(extractResourceLocatorValue(input)).toBe("");
			});
		});

		describe("buildSubtask", () => {
			test("builds subtask with all fields", () => {
				const input = {
					title: "Subtask 1",
					status: 0,
					sortOrder: 1,
					isAllDay: false,
					timeZone: "America/New_York",
				};
				const result = buildSubtask(input);
				expect(result.title).toBe("Subtask 1");
				expect(result.status).toBe(0);
				expect(result.sortOrder).toBe(1);
				expect(result.isAllDay).toBe(false);
				expect(result.timeZone).toBe("America/New_York");
			});

			test("omits empty title", () => {
				const input = { title: "", status: 0 };
				const result = buildSubtask(input);
				expect(result.title).toBeUndefined();
				expect(result.status).toBe(0);
			});

			test("omits undefined fields", () => {
				const input = { title: "Test" };
				const result = buildSubtask(input);
				expect(result.title).toBe("Test");
				expect(result.status).toBeUndefined();
				expect(result.sortOrder).toBeUndefined();
			});

			test("includes isAllDay when false", () => {
				const input = { isAllDay: false };
				const result = buildSubtask(input);
				expect(result.isAllDay).toBe(false);
			});

			test("includes isAllDay when true", () => {
				const input = { isAllDay: true };
				const result = buildSubtask(input);
				expect(result.isAllDay).toBe(true);
			});

			test("includes status 0", () => {
				const input = { status: 0 };
				const result = buildSubtask(input);
				expect(result.status).toBe(0);
			});

			test("includes sortOrder 0", () => {
				const input = { sortOrder: 0 };
				const result = buildSubtask(input);
				expect(result.sortOrder).toBe(0);
			});

			test("excludes empty string sortOrder", () => {
				const input = { sortOrder: "" };
				const result = buildSubtask(input);
				expect(result.sortOrder).toBeUndefined();
			});

			test("returns empty object for empty input", () => {
				const result = buildSubtask({});
				expect(Object.keys(result)).toHaveLength(0);
			});
		});

		describe("parseReminders", () => {
			test("parses single reminder", () => {
				expect(parseReminders("TRIGGER:PT0S")).toEqual(["TRIGGER:PT0S"]);
			});

			test("parses comma-separated reminders", () => {
				const result = parseReminders("TRIGGER:PT0S,TRIGGER:P0DT9H0M0S");
				expect(result).toEqual(["TRIGGER:PT0S", "TRIGGER:P0DT9H0M0S"]);
			});

			test("trims whitespace", () => {
				const result = parseReminders(
					"  TRIGGER:PT0S  ,  TRIGGER:P0DT9H0M0S  ",
				);
				expect(result).toEqual(["TRIGGER:PT0S", "TRIGGER:P0DT9H0M0S"]);
			});

			test("filters empty entries", () => {
				const result = parseReminders("TRIGGER:PT0S,,TRIGGER:P0DT9H0M0S,");
				expect(result).toEqual(["TRIGGER:PT0S", "TRIGGER:P0DT9H0M0S"]);
			});

			test("returns empty array for empty string", () => {
				expect(parseReminders("")).toEqual([]);
			});

			test("returns empty array for whitespace-only string", () => {
				expect(parseReminders("   ")).toEqual([]);
			});

			test("handles multiple commas", () => {
				const result = parseReminders(",,,TRIGGER:PT0S,,,");
				expect(result).toEqual(["TRIGGER:PT0S"]);
			});
		});

		describe("extractTagValue", () => {
			test("extracts value from object format", () => {
				const input = { mode: "list", value: "work" };
				expect(extractTagValue(input)).toBe("work");
			});

			test("extracts value from name mode", () => {
				const input = { mode: "name", value: "important" };
				expect(extractTagValue(input)).toBe("important");
			});

			test("returns string as-is", () => {
				expect(extractTagValue("urgent")).toBe("urgent");
			});

			test("returns empty string for undefined", () => {
				expect(extractTagValue(undefined)).toBe("");
			});

			test("returns empty string for object with empty value", () => {
				const input = { mode: "list", value: "" };
				expect(extractTagValue(input)).toBe("");
			});
		});

		describe("applyClearFields", () => {
			test("sets date fields to null", () => {
				const body: Record<string, unknown> = {
					dueDate: "2024-01-15",
					startDate: "2024-01-10",
					completedTime: "2024-01-14",
				};
				applyClearFields(body, ["dueDate", "startDate", "completedTime"]);
				expect(body.dueDate).toBeNull();
				expect(body.startDate).toBeNull();
				expect(body.completedTime).toBeNull();
			});

			test("sets text fields to empty string", () => {
				const body: Record<string, unknown> = {
					content: "Some content",
					desc: "Description",
					timeZone: "America/New_York",
				};
				applyClearFields(body, ["content", "desc", "timeZone"]);
				expect(body.content).toBe("");
				expect(body.desc).toBe("");
				expect(body.timeZone).toBe("");
			});

			test("sets reminders to empty array", () => {
				const body: Record<string, unknown> = {
					reminders: ["TRIGGER:PT0S"],
				};
				applyClearFields(body, ["reminders"]);
				expect(body.reminders).toEqual([]);
			});

			test("skips tags field (handled separately)", () => {
				const body: Record<string, unknown> = {
					tags: ["work", "urgent"],
				};
				applyClearFields(body, ["tags"]);
				expect(body.tags).toEqual(["work", "urgent"]);
			});

			test("handles multiple clear fields", () => {
				const body: Record<string, unknown> = {
					content: "Content",
					dueDate: "2024-01-15",
					reminders: ["TRIGGER:PT0S"],
				};
				applyClearFields(body, ["content", "dueDate", "reminders"]);
				expect(body.content).toBe("");
				expect(body.dueDate).toBeNull();
				expect(body.reminders).toEqual([]);
			});

			test("handles empty clearFields array", () => {
				const body: Record<string, unknown> = { content: "Original" };
				applyClearFields(body, []);
				expect(body.content).toBe("Original");
			});

			test("clears repeatFlag", () => {
				const body: Record<string, unknown> = {
					repeatFlag: "RRULE:FREQ=DAILY",
				};
				applyClearFields(body, ["repeatFlag"]);
				expect(body.repeatFlag).toBe("");
			});
		});

		describe("applyTagChanges", () => {
			test("adds new tags while preserving existing", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["work"] };
				const updateFields = {
					tags: {
						tagValues: [{ tag: { mode: "name", value: "urgent" } }],
					},
				};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toEqual(["work", "urgent"]);
			});

			test("removes specified tags", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["work", "urgent", "important"] };
				const updateFields = {
					removeTags: {
						tagValues: [{ tag: { mode: "name", value: "urgent" } }],
					},
				};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toEqual(["work", "important"]);
			});

			test("clears all tags when in clearFields", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["work", "urgent"] };
				const updateFields = {};
				applyTagChanges(body, currentTask, updateFields, ["tags"]);
				expect(body.tags).toEqual([]);
			});

			test("clears tags then adds new ones", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["old1", "old2"] };
				const updateFields = {
					tags: {
						tagValues: [{ tag: "newtag" }],
					},
				};
				applyTagChanges(body, currentTask, updateFields, ["tags"]);
				expect(body.tags).toEqual(["newtag"]);
			});

			test("removes and adds in same operation", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["work", "urgent"] };
				const updateFields = {
					removeTags: {
						tagValues: [{ tag: "urgent" }],
					},
					tags: {
						tagValues: [{ tag: "important" }],
					},
				};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toEqual(["work", "important"]);
			});

			test("does not add duplicate tags", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["work"] };
				const updateFields = {
					tags: {
						tagValues: [{ tag: "work" }, { tag: "urgent" }],
					},
				};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toEqual(["work", "urgent"]);
			});

			test("handles empty current tags", () => {
				const body: Record<string, unknown> = {};
				const currentTask = {};
				const updateFields = {
					tags: {
						tagValues: [{ tag: "work" }],
					},
				};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toEqual(["work"]);
			});

			test("does not modify body when no tag changes", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: ["work"] };
				const updateFields = {};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toBeUndefined();
			});

			test("filters empty tag values", () => {
				const body: Record<string, unknown> = {};
				const currentTask = { tags: [] };
				const updateFields = {
					tags: {
						tagValues: [
							{ tag: "" },
							{ tag: "valid" },
							{ tag: "   " },
						],
					},
				};
				applyTagChanges(body, currentTask, updateFields, []);
				expect(body.tags).toEqual(["valid"]);
			});
		});

		describe("buildTaskBody", () => {
			test("merges current task with updates", () => {
				const currentTask = { ...sampleTask };
				const updateFields = { title: "Updated Title" };
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.title).toBe("Updated Title");
				expect(result.id).toBe("task123");
				expect(result.projectId).toBe("project456");
			});

			test("uses inbox as default projectId", () => {
				const currentTask = {};
				const updateFields = { title: "Test" };
				const result = buildTaskBody(currentTask, updateFields, "task123", "");
				expect(result.projectId).toBe("inbox");
			});

			test("uses current task projectId as fallback", () => {
				const currentTask = { projectId: "existingProject" };
				const updateFields = { title: "Test" };
				const result = buildTaskBody(currentTask, updateFields, "task123", "");
				expect(result.projectId).toBe("existingProject");
			});

			test("applies clearFields before updates", () => {
				const currentTask = { content: "Old content" };
				const updateFields = { clearFields: ["content"] };
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.content).toBe("");
			});

			test("skips cleared fields even with update values", () => {
				const currentTask = { content: "Old" };
				const updateFields = {
					clearFields: ["content"],
					content: "New content",
				};
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.content).toBe("");
			});

			test("updates direct fields", () => {
				const currentTask = {};
				const updateFields = {
					title: "New Title",
					content: "New Content",
					priority: 5,
					status: 0,
				};
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.title).toBe("New Title");
				expect(result.content).toBe("New Content");
				expect(result.priority).toBe(5);
				expect(result.status).toBe(0);
			});

			test("skips empty string update values", () => {
				const currentTask = { title: "Original" };
				const updateFields = { title: "" };
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.title).toBe("Original");
			});

			test("skips null update values", () => {
				const currentTask = { title: "Original" };
				const updateFields = { title: null };
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.title).toBe("Original");
			});

			test("parses reminders string", () => {
				const currentTask = {};
				const updateFields = { reminders: "TRIGGER:PT0S,TRIGGER:P1D" };
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.reminders).toEqual(["TRIGGER:PT0S", "TRIGGER:P1D"]);
			});

			test("skips reminders when cleared", () => {
				const currentTask = { reminders: ["TRIGGER:PT0S"] };
				const updateFields = {
					clearFields: ["reminders"],
					reminders: "TRIGGER:P1D",
				};
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.reminders).toEqual([]);
			});

			test("builds subtasks from items", () => {
				const currentTask = {};
				const updateFields = {
					items: {
						item: [
							{ title: "Subtask 1", status: 0 },
							{ title: "Subtask 2", status: 1 },
						],
					},
				};
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.items).toHaveLength(2);
				expect(result.items[0].title).toBe("Subtask 1");
				expect(result.items[1].title).toBe("Subtask 2");
			});

			test("filters empty subtasks", () => {
				const currentTask = {};
				const updateFields = {
					items: {
						item: [
							{ title: "Valid" },
							{},
							{ title: "Also Valid" },
						],
					},
				};
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.items).toHaveLength(2);
			});

			test("preserves current task fields not in update", () => {
				const currentTask = {
					...sampleTask,
					customField: "preserved",
				};
				const updateFields = { title: "Updated" };
				const result = buildTaskBody(
					currentTask,
					updateFields,
					"task123",
					"project456",
				);
				expect(result.customField).toBe("preserved");
			});
		});
	});

	describe("taskUpdateExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("updates task with title change", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							title: "Updated Title",
						},
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: sampleTask,
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: { ...sampleTask, title: "Updated Title" },
				});

				const result = await taskUpdateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.title).toBe("Updated Title");
				expectApiCalled(mockContext, "POST", ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"));
			});

			test("throws error when taskId is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						taskId: { mode: "id", value: "" },
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {},
					},
				});

				await expect(taskUpdateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task ID is required",
					);
			});

			test("throws error when taskId is whitespace", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						taskId: { mode: "id", value: "   " },
						jsonParameters: false,
						updateFields: {},
					},
				});

				await expect(taskUpdateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task ID is required",
					);
			});
		});

		describe("V2 API (Session)", () => {
			test("updates task via batch endpoint", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							title: "V2 Updated Title",
						},
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.TASKS_BATCH,
					response: mockTaskBatchResponse,
				});

				const result = await taskUpdateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(mockContext, "POST", ENDPOINTS.TASKS_BATCH);
			});

			test("preserves existing tags when adding new ones", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: {
							tags: {
								tagValues: [{ tag: { mode: "name", value: "newtag" } }],
							},
						},
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.SYNC,
					response: mockSyncResponse,
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.TASKS_BATCH,
					response: mockTaskBatchResponse,
				});

				await taskUpdateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASKS_BATCH));
				expect(batchCall).toBeDefined();
				const body = batchCall?.body as { update: Array<{ tags: string[] }> };
				expect(body.update[0].tags).toContain("work");
				expect(body.update[0].tags).toContain("urgent");
				expect(body.update[0].tags).toContain("newtag");
			});
		});

		describe("JSON Parameters Mode", () => {
			test("sends raw JSON body", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						projectId: { mode: "id", value: "project456" },
						jsonParameters: true,
						additionalFieldsJson: JSON.stringify({
							title: "JSON Title",
							priority: 5,
						}),
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: sampleTask,
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: { ...sampleTask, title: "JSON Title", priority: 5 },
				});

				const result = await taskUpdateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				expect(postCall?.body).toMatchObject({
					title: "JSON Title",
					priority: 5,
				});
			});

			test("throws on invalid JSON", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						jsonParameters: true,
						additionalFieldsJson: "{ invalid json }",
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: sampleTask,
				});

				await expect(taskUpdateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Invalid JSON",
					);
			});
		});

		describe("Edge Cases", () => {
			test("uses inbox as default projectId", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						projectId: "",
						jsonParameters: false,
						updateFields: { title: "Test" },
					},
				});

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: { id: "task123", title: "Original" },
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: { id: "task123", title: "Test", projectId: "inbox" },
				});

				await taskUpdateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				expect((postCall?.body as Record<string, unknown>).projectId).toBe(
					"inbox",
				);
			});

			test("preserves title from current task when not updating", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						taskId: { mode: "id", value: "task123" },
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						updateFields: { priority: 5 },
					},
				});

				const taskWithTitle = { ...sampleTask, title: "Original Title" };

				mockContext._addApiHandler({
					method: "GET",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: taskWithTitle,
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK_UPDATE("task123"),
					response: { ...taskWithTitle, priority: 5 },
				});

				const result = await taskUpdateExecute.call(mockContext as any, 0);

				expect(result[0].json.title).toBe("Original Title");
			});
		});
	});
});
