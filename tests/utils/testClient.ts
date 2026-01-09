/**
 * Test utilities for TickTick V2 API testing
 * Provides authentication and API request helpers using Bun's native fetch
 */

const V2_USER_AGENT = "Mozilla/5.0 (rv:145.0) Firefox/145.0";
const V2_DEVICE_VERSION = 6430;
const API_BASE = "https://api.ticktick.com";

/**
 * Convert object to JSON with spaces after colons and commas (Python-style)
 * TickTick's V2 API requires this format
 */
export function toPythonStyleJson(obj: object): string {
	return JSON.stringify(obj, null, 0).replace(/,/g, ", ").replace(/:/g, ": ");
}

/**
 * Generate a MongoDB-style ObjectId (24 hex chars)
 */
export function generateObjectId(): string {
	const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
	const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return timestamp + random;
}

/**
 * Build the X-Device header with Python-style JSON
 */
export function buildDeviceHeader(deviceId: string): string {
	return toPythonStyleJson({
		platform: "web",
		version: V2_DEVICE_VERSION,
		id: deviceId,
	});
}

export interface AuthSession {
	token: string;
	deviceId: string;
	inboxId: string;
	userId: string;
	username: string;
}

export interface ApiResponse<T = unknown> {
	data: T;
	statusCode: number;
	headers: Headers;
}

/**
 * Authenticate with TickTick V2 API
 */
export async function authenticate(): Promise<AuthSession> {
	const username = process.env.TICKTICK_USERNAME;
	const password = process.env.TICKTICK_PASSWORD;

	if (!username || !password) {
		throw new Error(
			"TICKTICK_USERNAME and TICKTICK_PASSWORD must be set in .env",
		);
	}

	const deviceId = generateObjectId();
	const bodyJson = toPythonStyleJson({ username, password });
	const xDevice = buildDeviceHeader(deviceId);

	const response = await fetch(
		`${API_BASE}/api/v2/user/signon?wc=true&remember=true`,
		{
			method: "POST",
			headers: {
				"User-Agent": V2_USER_AGENT,
				"X-Device": xDevice,
				"Content-Type": "application/json",
			},
			body: bodyJson,
		},
	);

	const data = await response.json();

	if (!response.ok) {
		if (data.errorCode === "incorrect_password_too_many_times") {
			throw new Error("Account temporarily locked. Wait 15-30 minutes.");
		}
		throw new Error(
			`Authentication failed: ${data.errorMessage || data.errorCode}`,
		);
	}

	if (!data.token) {
		throw new Error("No token in authentication response");
	}

	return {
		token: data.token,
		deviceId,
		inboxId: data.inboxId || "",
		userId: data.userId || "",
		username: data.username || username,
	};
}

/**
 * TickTick V2 API Test Client
 */
export class TickTickTestClient {
	private session: AuthSession | null = null;

	async connect(): Promise<void> {
		this.session = await authenticate();
	}

	disconnect(): void {
		this.session = null;
	}

	get isConnected(): boolean {
		return this.session !== null;
	}

	get auth(): AuthSession {
		if (!this.session) {
			throw new Error("Not connected. Call connect() first.");
		}
		return this.session;
	}

	/**
	 * Make authenticated V2 API request
	 */
	async request<T = unknown>(
		method: string,
		endpoint: string,
		body?: object,
	): Promise<ApiResponse<T>> {
		if (!this.session) {
			throw new Error("Not connected. Call connect() first.");
		}

		const xDevice = buildDeviceHeader(this.session.deviceId);

		// Determine the path based on whether it's a V1 or V2 endpoint
		const path = endpoint.startsWith("/open/v1")
			? `/api${endpoint}`
			: `/api/v2${endpoint}`;

		const response = await fetch(`${API_BASE}${path}`, {
			method,
			headers: {
				"User-Agent": V2_USER_AGENT,
				"X-Device": xDevice,
				"Cookie": `t=${this.session.token}`,
				"Content-Type": "application/json",
			},
			body: body ? toPythonStyleJson(body) : undefined,
		});

		let data: T;
		const text = await response.text();
		try {
			data = text ? JSON.parse(text) : ({} as T);
		} catch {
			data = text as unknown as T;
		}

		return {
			data,
			statusCode: response.status,
			headers: response.headers,
		};
	}

	// Convenience methods
	async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>("GET", endpoint);
	}

	async post<T = unknown>(
		endpoint: string,
		body?: object,
	): Promise<ApiResponse<T>> {
		return this.request<T>("POST", endpoint, body);
	}

	async put<T = unknown>(
		endpoint: string,
		body?: object,
	): Promise<ApiResponse<T>> {
		return this.request<T>("PUT", endpoint, body);
	}

	async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>("DELETE", endpoint);
	}
}

/**
 * Create a connected test client
 */
export async function createTestClient(): Promise<TickTickTestClient> {
	const client = new TickTickTestClient();
	await client.connect();
	return client;
}

/**
 * Generate a unique test name with timestamp
 */
export function uniqueName(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
