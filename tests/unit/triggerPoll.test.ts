import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { INode, INodeExecutionData } from "n8n-workflow";
import { TickTickTrigger } from "../../nodes/TickTick/TickTickTrigger.node";
import { ENDPOINTS } from "../../nodes/TickTick/helpers/constants";

interface ApiCall {
	method: string;
	endpoint: string;
}

interface PollMockOptions {
	authentication?:
		| "tickTickTokenApi"
		| "tickTickOAuth2Api"
		| "tickTickSessionApi";
	parameters?: Record<string, unknown>;
	mode?: "manual" | "trigger";
	staticData?: Record<string, unknown>;
	apiResponses?: Record<string, unknown>;
}

function createPollContext(options: PollMockOptions = {}) {
	const {
		authentication = "tickTickTokenApi",
		parameters = {},
		mode = "trigger",
		staticData = {},
		apiResponses = {},
	} = options;

	const calls: ApiCall[] = [];
	const node: INode = {
		id: "trigger-test",
		name: "TickTick Trigger",
		type: "n8n-nodes-ticktick.tickTickTrigger",
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};

	const handle = (
		method: string,
		url: string,
		returnFullResponse?: boolean,
	): unknown => {
		const endpoint = url
			.replace(/^https:\/\/api\.ticktick\.com\/api\/v2/, "")
			.replace(/^https:\/\/api\.ticktick\.com/, "");

		if (endpoint.startsWith("/user/signon")) {
			const body = {
				token: "mock-session-token",
				inboxId: "inbox",
				userId: "mock-user",
			};
			return returnFullResponse
				? { body, headers: { "set-cookie": ["t=mock-session-token; Path=/"] } }
				: body;
		}

		calls.push({ method, endpoint });
		const key = Object.keys(apiResponses).find((k) => endpoint.startsWith(k));
		return key ? apiResponses[key] : {};
	};

	const ctx = {
		getNode: mock(() => node),
		getMode: mock(() => mode),
		getNodeParameter: mock((name: string, fallback?: unknown) => {
			if (name === "authentication") return authentication;
			const v = parameters[name];
			return v !== undefined ? v : fallback;
		}),
		getWorkflowStaticData: mock(() => staticData),
		getCredentials: mock(async () => ({
			username: "test@example.com",
			password: "test",
		})),
		helpers: {
			httpRequest: mock(
				async (req: {
					method: string;
					url: string;
					returnFullResponse?: boolean;
				}) => handle(req.method, req.url, req.returnFullResponse),
			),
			httpRequestWithAuthentication: mock(
				async (_cred: string, req: { method: string; url: string }) =>
					handle(req.method, req.url),
			),
			returnJsonArray: mock((items: unknown[]): INodeExecutionData[] =>
				(items as Record<string, unknown>[]).map((json) => ({ json }))
			),
		},
		_calls: calls,
	};

	return ctx;
}

const trigger = new TickTickTrigger();

describe("TickTickTrigger.poll", () => {
	describe("first poll baseline", () => {
		test("returns null and writes lastCreatedTime when no prior state", async () => {
			const staticData: Record<string, unknown> = {};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: { event: "taskCreated", options: {} },
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{ id: "t1", projectId: "p1", createdTime: "2026-04-20T10:00:00.000+0000" },
								{ id: "t2", projectId: "p1", createdTime: "2026-04-21T10:00:00.000+0000" },
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);

			expect(result).toBeNull();
			expect(staticData.lastCreatedTime).toBe("2026-04-21T10:00:00.000+0000");
		});
	});

	describe("subsequent polls", () => {
		test("emits only tasks newer than lastCreatedTime", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-20T12:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: { event: "taskCreated", options: {} },
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{ id: "old", projectId: "p1", createdTime: "2026-04-20T10:00:00.000+0000" },
								{ id: "new1", projectId: "p1", createdTime: "2026-04-20T15:00:00.000+0000" },
								{ id: "new2", projectId: "p1", createdTime: "2026-04-21T09:00:00.000+0000" },
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);

			expect(result).not.toBeNull();
			const emitted = result![0].map((i) => i.json.id);
			expect(emitted).toEqual(["new1", "new2"]);
			expect(staticData.lastCreatedTime).toBe("2026-04-21T09:00:00.000+0000");
		});

		test("returns null when no new tasks", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-25T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: { event: "taskCreated", options: {} },
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{ id: "old", projectId: "p1", createdTime: "2026-04-20T10:00:00.000+0000" },
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).toBeNull();
		});
	});

	describe("flood protection", () => {
		test("caps emission at 500 oldest, advances watermark to last emitted", async () => {
			const baseMs = Date.parse("2026-05-01T00:00:00.000Z");
			const formatTs = (offsetSeconds: number) => {
				const iso = new Date(baseMs + offsetSeconds * 1000).toISOString();
				// Match the +0000 suffix shape used elsewhere in these tests
				return iso.replace("Z", "+0000");
			};
			const tasks = Array.from({ length: 600 }, (_, i) => ({
				id: `t${i}`,
				projectId: "p1",
				createdTime: formatTs(i),
			}));

			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-30T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: { event: "taskCreated", options: {} },
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: tasks,
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);

			expect(result).not.toBeNull();
			expect(result![0]).toHaveLength(500);
			const ids = result![0].map((i) => i.json.id);
			expect(ids[0]).toBe("t0");
			expect(ids[499]).toBe("t499");
			expect(staticData.lastCreatedTime).toBe(formatTs(499));
		});
	});

	describe("project filter", () => {
		test("excludes tasks from non-selected projects (V2)", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-20T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: {
					event: "taskCreated",
					options: {
						projectIds: {
							project: [{ value: { mode: "id", value: "p1" } }],
						},
					},
				},
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{ id: "keep", projectId: "p1", createdTime: "2026-04-21T10:00:00.000+0000" },
								{ id: "drop", projectId: "p2", createdTime: "2026-04-21T11:00:00.000+0000" },
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).not.toBeNull();
			const ids = result![0].map((i) => i.json.id);
			expect(ids).toEqual(["keep"]);
		});
	});

	describe("assignee filter", () => {
		test("matches numeric assignee", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-20T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: {
					event: "taskCreated",
					options: {
						assigneeIds: {
							assignee: [{ value: { mode: "id", value: "12345" } }],
						},
					},
				},
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{ id: "match", projectId: "p1", createdTime: "2026-04-21T10:00:00.000+0000", assignee: 12345 },
								{ id: "miss", projectId: "p1", createdTime: "2026-04-21T11:00:00.000+0000", assignee: 99999 },
								{ id: "none", projectId: "p1", createdTime: "2026-04-21T12:00:00.000+0000" },
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).not.toBeNull();
			const ids = result![0].map((i) => i.json.id);
			expect(ids).toEqual(["match"]);
		});

		test("matches TaskAssignee object shape", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-20T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				parameters: {
					event: "taskCreated",
					options: {
						assigneeIds: {
							assignee: [{ value: { mode: "id", value: "12345" } }],
						},
					},
				},
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{
									id: "match",
									projectId: "p1",
									createdTime: "2026-04-21T10:00:00.000+0000",
									assignee: { userId: 12345, displayName: "Alice" },
								},
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).not.toBeNull();
			expect(result![0]).toHaveLength(1);
			expect(result![0][0].json.id).toBe("match");
		});
	});

	describe("manual mode", () => {
		test("returns single most-recent task and does not write static data", async () => {
			const staticData: Record<string, unknown> = {};
			const ctx = createPollContext({
				authentication: "tickTickSessionApi",
				mode: "manual",
				parameters: { event: "taskCreated", options: {} },
				staticData,
				apiResponses: {
					[ENDPOINTS.SYNC]: {
						syncTaskBean: {
							update: [
								{ id: "older", projectId: "p1", createdTime: "2026-04-20T10:00:00.000+0000" },
								{ id: "newest", projectId: "p1", createdTime: "2026-04-22T10:00:00.000+0000" },
							],
							add: [],
						},
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).not.toBeNull();
			expect(result![0]).toHaveLength(1);
			expect(result![0][0].json.id).toBe("newest");
			expect(staticData.lastCreatedTime).toBeUndefined();
		});
	});

	describe("V1 auth", () => {
		test("iterates explicitly-selected projects", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-20T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickTokenApi",
				parameters: {
					event: "taskCreated",
					options: {
						projectIds: {
							project: [
								{ value: { mode: "id", value: "p1" } },
								{ value: { mode: "id", value: "p2" } },
							],
						},
					},
				},
				staticData,
				apiResponses: {
					[ENDPOINTS.OPEN_V1_PROJECT_DATA("p1")]: {
						tasks: [
							{ id: "a", projectId: "p1", createdTime: "2026-04-21T10:00:00.000+0000" },
						],
					},
					[ENDPOINTS.OPEN_V1_PROJECT_DATA("p2")]: {
						tasks: [
							{ id: "b", projectId: "p2", createdTime: "2026-04-22T10:00:00.000+0000" },
						],
					},
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).not.toBeNull();
			const ids = result![0].map((i) => i.json.id).sort();
			expect(ids).toEqual(["a", "b"]);

			const endpoints = ctx._calls.map((c) => c.endpoint);
			expect(endpoints).toContain(ENDPOINTS.OPEN_V1_PROJECT_DATA("p1"));
			expect(endpoints).toContain(ENDPOINTS.OPEN_V1_PROJECT_DATA("p2"));
		});

		test("lists all projects when none selected", async () => {
			const staticData: Record<string, unknown> = {
				lastCreatedTime: "2026-04-20T00:00:00.000+0000",
			};
			const ctx = createPollContext({
				authentication: "tickTickTokenApi",
				parameters: { event: "taskCreated", options: {} },
				staticData,
				apiResponses: {
					[ENDPOINTS.OPEN_V1_PROJECT_DATA("p1")]: {
						tasks: [
							{ id: "a", projectId: "p1", createdTime: "2026-04-21T10:00:00.000+0000" },
						],
					},
					[ENDPOINTS.OPEN_V1_PROJECT]: [
						{ id: "p1", name: "P1", closed: false },
						{ id: "p2", name: "P2", closed: true },
					],
				},
			});

			const result = await trigger.poll.call(ctx as never);
			expect(result).not.toBeNull();
			const endpoints = ctx._calls.map((c) => c.endpoint);
			expect(endpoints).toContain(ENDPOINTS.OPEN_V1_PROJECT);
			expect(endpoints).toContain(ENDPOINTS.OPEN_V1_PROJECT_DATA("p1"));
			expect(endpoints).not.toContain(ENDPOINTS.OPEN_V1_PROJECT_DATA("p2"));
		});
	});

	beforeEach(() => {
		// Each test creates its own context, so nothing global to reset.
	});
});
