import { describe, expect, test } from "bun:test";
import {
	createMockExecuteFunctions,
	expectApiCalled,
} from "../../__mocks__/n8nContext";
import { mockTaskBatchResponse } from "../../__mocks__/apiResponses";
import { sampleTask } from "../../__mocks__/fixtures/tasks";
import { taskCreateExecute } from "../../../../nodes/TickTick/resources/tasks/operations/TaskCreate";
import { ENDPOINTS } from "../../../../nodes/TickTick/constants/endpoints";

describe("TaskCreate Operation", () => {
	describe("taskCreateExecute", () => {
		describe("V1 API (Token/OAuth2)", () => {
			test("creates task with title only", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "New Task",
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						additionalFields: {},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: { ...sampleTask, title: "New Task" },
				});

				const result = await taskCreateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expect(result[0].json.title).toBe("New Task");
				expectApiCalled(mockContext, "POST", ENDPOINTS.OPEN_V1_TASK);
			});

			test("creates task with all additional fields", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "Full Task",
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						additionalFields: {
							content: "Task content",
							priority: 5,
							isAllDay: true,
							status: 0,
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: {
						...sampleTask,
						title: "Full Task",
						content: "Task content",
						priority: 5,
					},
				});

				const result = await taskCreateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.title).toBe("Full Task");
				expect(body.content).toBe("Task content");
				expect(body.priority).toBe(5);
				expect(body.isAllDay).toBe(true);
			});

			test("throws error when title is empty", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						title: "",
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						additionalFields: {},
					},
				});

				await expect(taskCreateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task title is required",
					);
			});

			test("throws error when title is whitespace", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						title: "   ",
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						additionalFields: {},
					},
				});

				await expect(taskCreateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Task title is required",
					);
			});

			test("parses reminders from comma-separated string", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "Task with Reminders",
						projectId: "",
						jsonParameters: false,
						additionalFields: {
							reminders: "TRIGGER:PT0S,TRIGGER:P1D",
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: sampleTask,
				});

				await taskCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.reminders).toEqual(["TRIGGER:PT0S", "TRIGGER:P1D"]);
			});

			test("handles subtasks", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "Task with Subtasks",
						projectId: "",
						jsonParameters: false,
						additionalFields: {
							items: {
								item: [
									{ title: "Subtask 1", status: 0 },
									{ title: "Subtask 2", status: 1 },
								],
							},
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: sampleTask,
				});

				await taskCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.items as Array<unknown>).toHaveLength(2);
			});
		});

		describe("V2 API (Session)", () => {
			test("creates task via batch endpoint", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickSessionApi",
					nodeParameters: {
						title: "V2 Task",
						projectId: { mode: "id", value: "project456" },
						jsonParameters: false,
						additionalFields: {},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.TASKS_BATCH,
					response: mockTaskBatchResponse,
				});

				const result = await taskCreateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				expectApiCalled(mockContext, "POST", ENDPOINTS.TASKS_BATCH);

				const calls = mockContext._getApiCalls();
				const batchCall = calls.find((c) => c.endpoint.includes(ENDPOINTS.TASKS_BATCH));
				const body = batchCall?.body as { add: Array<Record<string, unknown>> };
				expect(body.add).toHaveLength(1);
				expect(body.add[0].title).toBe("V2 Task");
			});
		});

		describe("JSON Parameters Mode", () => {
			test("sends raw JSON body", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						jsonParameters: true,
						additionalFieldsJson: JSON.stringify({
							title: "JSON Task",
							priority: 5,
							projectId: "project456",
						}),
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: { ...sampleTask, title: "JSON Task" },
				});

				const result = await taskCreateExecute.call(mockContext as any, 0);

				expect(result).toHaveLength(1);
				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				expect(postCall?.body).toMatchObject({
					title: "JSON Task",
					priority: 5,
				});
			});

			test("throws on invalid JSON", async () => {
				const mockContext = createMockExecuteFunctions({
					nodeParameters: {
						jsonParameters: true,
						additionalFieldsJson: "{ invalid }",
					},
				});

				await expect(taskCreateExecute.call(mockContext as any, 0)).rejects
					.toThrow(
						"Invalid JSON",
					);
			});
		});

		describe("Edge Cases", () => {
			test("handles empty projectId", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "Task without Project",
						projectId: "",
						jsonParameters: false,
						additionalFields: {},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: sampleTask,
				});

				await taskCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.projectId).toBeUndefined();
			});

			test("extracts projectId from resource locator object", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "Task",
						projectId: { mode: "list", value: "extracted-project-id" },
						jsonParameters: false,
						additionalFields: {},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: sampleTask,
				});

				await taskCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.projectId).toBe("extracted-project-id");
			});

			test("skips empty additional fields", async () => {
				const mockContext = createMockExecuteFunctions({
					authentication: "tickTickTokenApi",
					nodeParameters: {
						title: "Task",
						projectId: "",
						jsonParameters: false,
						additionalFields: {
							content: "",
							desc: null,
							priority: undefined,
						},
					},
				});

				mockContext._addApiHandler({
					method: "POST",
					endpoint: ENDPOINTS.OPEN_V1_TASK,
					response: sampleTask,
				});

				await taskCreateExecute.call(mockContext as any, 0);

				const calls = mockContext._getApiCalls();
				const postCall = calls.find((c) => c.method === "POST");
				const body = postCall?.body as Record<string, unknown>;
				expect(body.content).toBeUndefined();
				expect(body.desc).toBeUndefined();
				expect(body.priority).toBeUndefined();
			});
		});
	});
});
