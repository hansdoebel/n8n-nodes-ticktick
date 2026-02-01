import { mock } from "bun:test";
import type { INode } from "n8n-workflow";

export interface MockContextOptions {
	nodeParameters?: Record<string, unknown>;
	credentials?: Record<string, Record<string, unknown>>;
	authentication?:
		| "tickTickTokenApi"
		| "tickTickOAuth2Api"
		| "tickTickSessionApi";
	v2SessionToken?: string;
	v2InboxId?: string;
}

export interface MockApiHandler {
	method: string;
	endpoint: string | RegExp;
	response: unknown;
	statusCode?: number;
}

interface ApiCall {
	method: string;
	endpoint: string;
	body?: unknown;
	qs?: unknown;
}

export interface MockExecuteFunctions {
	getNodeParameter: ReturnType<typeof mock>;
	getCredentials: ReturnType<typeof mock>;
	getNode: ReturnType<typeof mock>;
	helpers: {
		httpRequest: ReturnType<typeof mock>;
		requestWithAuthentication: ReturnType<typeof mock>;
		requestOAuth2: ReturnType<typeof mock>;
	};
	_apiHandlers: MockApiHandler[];
	_addApiHandler: (handler: MockApiHandler) => void;
	_getApiCalls: () => ApiCall[];
	_clearApiCalls: () => void;
}

export function createMockExecuteFunctions(
	options: MockContextOptions = {},
): MockExecuteFunctions {
	const {
		nodeParameters = {},
		credentials = {},
		authentication = "tickTickTokenApi",
		v2SessionToken = "mock-session-token",
		v2InboxId = "inbox",
	} = options;

	const apiCalls: ApiCall[] = [];
	const apiHandlers: MockApiHandler[] = [];

	const mockNode: INode = {
		id: "test-node-id",
		name: "TickTick",
		type: "n8n-nodes-ticktick.tickTick",
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};

	function findHandler(
		method: string,
		endpoint: string,
	): MockApiHandler | undefined {
		return apiHandlers.find((h) => {
			const methodMatch = h.method === method;
			const endpointMatch = h.endpoint instanceof RegExp
				? h.endpoint.test(endpoint)
				: h.endpoint === endpoint || endpoint.includes(h.endpoint as string);
			return methodMatch && endpointMatch;
		});
	}

	async function handleRequest(
		requestMethod: string,
		url: string,
		body?: unknown,
		returnFullResponse?: boolean,
		qs?: unknown,
	): Promise<unknown> {
		const endpoint = url
			.replace(/^https:\/\/api\.ticktick\.com\/api\/v2/, "")
			.replace(/^https:\/\/api\.ticktick\.com/, "");

		if (endpoint.includes("/user/signon")) {
			const signonResponse = {
				token: v2SessionToken,
				inboxId: v2InboxId,
				userId: "mock-user-id",
			};
			if (returnFullResponse) {
				return {
					body: signonResponse,
					headers: {
						"set-cookie": [`t=${v2SessionToken}; Path=/`],
					},
				};
			}
			return signonResponse;
		}

		apiCalls.push({ method: requestMethod, endpoint, body, qs });

		const handler = findHandler(requestMethod, endpoint);

		if (handler) {
			if (handler.statusCode && handler.statusCode >= 400) {
				const error = new Error("API Error") as Error & {
					statusCode: number;
				};
				error.statusCode = handler.statusCode;
				throw error;
			}
			return handler.response;
		}

		return {};
	}

	const mockContext: MockExecuteFunctions = {
		getNodeParameter: mock(
			(name: string, _itemIndex: number, fallback?: unknown) => {
				if (name === "authentication") {
					return authentication;
				}
				const value = nodeParameters[name];
				return value !== undefined ? value : fallback;
			},
		),

		getCredentials: mock(async (type: string) => {
			if (type === "tickTickSessionApi" && !credentials[type]) {
				return {
					username: "test@example.com",
					password: "test-password",
				};
			}
			return credentials[type] || {};
		}),

		getNode: mock(() => mockNode),

		helpers: {
			httpRequest: mock(
				async (
					requestOptions: {
						method: string;
						url: string;
						body?: unknown;
						returnFullResponse?: boolean;
						qs?: unknown;
					},
				) => {
					return handleRequest(
						requestOptions.method,
						requestOptions.url,
						requestOptions.body,
						requestOptions.returnFullResponse,
						requestOptions.qs,
					);
				},
			),

			requestWithAuthentication: mock(
				async (
					_credType: string,
					requestOptions: { method: string; url: string; body?: unknown },
				) => {
					return handleRequest(
						requestOptions.method,
						requestOptions.url,
						requestOptions.body,
					);
				},
			),

			requestOAuth2: mock(
				async (
					_credType: string,
					requestOptions: { method: string; url: string; body?: unknown },
				) => {
					return handleRequest(
						requestOptions.method,
						requestOptions.url,
						requestOptions.body,
					);
				},
			),
		},

		_apiHandlers: apiHandlers,
		_addApiHandler: (handler: MockApiHandler) => apiHandlers.push(handler),
		_getApiCalls: () => apiCalls,
		_clearApiCalls: () => {
			apiCalls.length = 0;
		},
	};

	return mockContext;
}

export function expectApiCalled(
	mockContext: MockExecuteFunctions,
	method: string,
	endpointPattern: string | RegExp,
): void {
	const calls = mockContext._getApiCalls();
	const match = calls.find((c) => {
		const methodMatch = c.method === method;
		const endpointMatch = endpointPattern instanceof RegExp
			? endpointPattern.test(c.endpoint)
			: c.endpoint.includes(endpointPattern);
		return methodMatch && endpointMatch;
	});
	if (!match) {
		throw new Error(
			`Expected API call ${method} ${endpointPattern} not found. Calls: ${
				JSON.stringify(calls)
			}`,
		);
	}
}

export function expectApiCalledWith(
	mockContext: MockExecuteFunctions,
	method: string,
	endpointPattern: string | RegExp,
	bodyMatcher: (body: unknown) => boolean,
): void {
	const calls = mockContext._getApiCalls();
	const match = calls.find((c) => {
		const methodMatch = c.method === method;
		const endpointMatch = endpointPattern instanceof RegExp
			? endpointPattern.test(c.endpoint)
			: c.endpoint.includes(endpointPattern);
		return methodMatch && endpointMatch && bodyMatcher(c.body);
	});
	if (!match) {
		throw new Error(
			`Expected API call ${method} ${endpointPattern} with matching body not found. Calls: ${
				JSON.stringify(calls)
			}`,
		);
	}
}
