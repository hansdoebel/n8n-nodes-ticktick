import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { TICKTICK_URLS } from "../../../nodes/TickTick/constants/urls";

export const V2_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const V2_DEVICE_VERSION = 6430;
export const API_BASE = TICKTICK_URLS.API_BASE_URL;

export function toPythonStyleJson(obj: object): string {
	return JSON.stringify(obj, null, 0).replace(/,/g, ", ").replace(/:/g, ": ");
}

export function generateObjectId(): string {
	const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
	const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return timestamp + random;
}

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

const SESSION_CACHE_DIR = join(import.meta.dir, "..", "..", "..", ".tmp");
const SESSION_CACHE_FILE = join(SESSION_CACHE_DIR, "test-session.json");
const SESSION_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours

interface CachedSession extends AuthSession {
	expiresAt: number;
}

function loadCachedSession(): AuthSession | null {
	if (!existsSync(SESSION_CACHE_FILE)) return null;
	try {
		const data: CachedSession = JSON.parse(
			readFileSync(SESSION_CACHE_FILE, "utf-8"),
		);
		if (data.expiresAt > Date.now()) {
			return data;
		}
		unlinkSync(SESSION_CACHE_FILE);
	} catch {
		try {
			unlinkSync(SESSION_CACHE_FILE);
		} catch {}
	}
	return null;
}

function saveCachedSession(session: AuthSession): void {
	if (!existsSync(SESSION_CACHE_DIR)) {
		mkdirSync(SESSION_CACHE_DIR, { recursive: true });
	}
	const cached: CachedSession = {
		...session,
		expiresAt: Date.now() + SESSION_TTL_MS,
	};
	writeFileSync(SESSION_CACHE_FILE, JSON.stringify(cached, null, 2));
}

let authPromise: Promise<AuthSession> | null = null;

export async function authenticate(): Promise<AuthSession> {
	const cached = loadCachedSession();
	if (cached) return cached;

	if (authPromise) return authPromise;

	authPromise = authenticateFresh();
	try {
		const session = await authPromise;
		saveCachedSession(session);
		return session;
	} finally {
		authPromise = null;
	}
}

async function authenticateFresh(): Promise<AuthSession> {
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
				"Origin": TICKTICK_URLS.BASE_URL,
				"Referer": `${TICKTICK_URLS.BASE_URL}/`,
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

	async request<T = unknown>(
		method: string,
		endpoint: string,
		body?: object,
	): Promise<ApiResponse<T>> {
		if (!this.session) {
			throw new Error("Not connected. Call connect() first.");
		}

		const xDevice = buildDeviceHeader(this.session.deviceId);

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
				"Origin": TICKTICK_URLS.BASE_URL,
				"Referer": `${TICKTICK_URLS.BASE_URL}/`,
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

export async function createTestClient(): Promise<TickTickTestClient> {
	const client = new TickTickTestClient();
	await client.connect();
	return client;
}

export function uniqueName(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
