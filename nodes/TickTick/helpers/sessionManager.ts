import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";

const V2_API_BASE = "https://api.ticktick.com/api/v2";
const V2_USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const V2_DEVICE_VERSION = 6430;

interface SessionCache {
	token: string;
	inboxId: string;
	expiresAt: number;
	deviceId: string;
}

// In-memory session cache keyed by username
const sessionCache = new Map<string, SessionCache>();

// Session validity duration (23 hours to be safe, actual is 24h)
const SESSION_TTL_MS = 23 * 60 * 60 * 1000;

/**
 * Generate a consistent device ID for this n8n instance
 * Uses a MongoDB ObjectId-like format (24 hex chars)
 */
export function generateDeviceId(): string {
	// Generate a random device ID using Math.random
	const chars = "0123456789abcdef";
	let result = "";
	for (let i = 0; i < 24; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

/**
 * Build the X-Device header required by V2 API
 */
export function buildDeviceHeader(deviceId: string): string {
	return JSON.stringify({
		platform: "web",
		os: "macOS 10.15.7",
		device: "Chrome 120.0.0.0",
		name: "",
		version: V2_DEVICE_VERSION,
		id: deviceId,
		channel: "website",
		campaign: "",
		websocket: "",
	});
}

/**
 * Build all required headers for V2 API requests
 */
export function buildV2Headers(
	sessionToken: string,
	deviceId: string,
): IDataObject {
	return {
		"User-Agent": V2_USER_AGENT,
		"X-Device": buildDeviceHeader(deviceId),
		"Cookie": `t=${sessionToken}`,
		"Content-Type": "application/json",
	};
}

/**
 * Authenticate with TickTick V2 API and get a session token
 */
async function authenticateV2(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	username: string,
	password: string,
	deviceId: string,
): Promise<{ token: string; inboxId: string }> {
	const response = await context.helpers.httpRequest({
		method: "POST",
		url: `${V2_API_BASE}/user/signon`,
		headers: {
			"User-Agent": V2_USER_AGENT,
			"X-Device": buildDeviceHeader(deviceId),
			"Content-Type": "application/json",
		},
		body: {
			username,
			password,
			wc: true,
			remember: true,
		},
		json: true,
		returnFullResponse: true,
	});

	// Check if 2FA is required
	if (response.body.authId && !response.body.token) {
		throw new NodeApiError(
			context.getNode(),
			{
				message:
					"Two-factor authentication is required but not supported. Please disable 2FA or use a different authentication method.",
			} as JsonObject,
		);
	}

	// Extract token from response body or cookies
	let token = response.body.token;
	if (!token) {
		// Try to get from Set-Cookie header
		const cookies = response.headers["set-cookie"];
		if (cookies) {
			const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
			for (const cookie of cookieArray) {
				const match = cookie.match(/^t=([^;]+)/);
				if (match) {
					token = match[1];
					break;
				}
			}
		}
	}

	if (!token) {
		throw new NodeApiError(
			context.getNode(),
			{
				message:
					"Failed to obtain session token from TickTick. Please check your credentials.",
			} as JsonObject,
		);
	}

	const inboxId = response.body.inboxId || "";

	return { token, inboxId };
}

/**
 * Get a valid V2 session token, using cache if available
 */
export async function getV2Session(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<{ token: string; inboxId: string; deviceId: string }> {
	const credentials = await context.getCredentials("tickTickSessionApi");
	const username = credentials.username as string;
	const password = credentials.password as string;

	// Check cache for valid session
	const cached = sessionCache.get(username);
	if (cached && cached.expiresAt > Date.now()) {
		return {
			token: cached.token,
			inboxId: cached.inboxId,
			deviceId: cached.deviceId,
		};
	}

	// Generate or reuse device ID
	const deviceId = cached?.deviceId || generateDeviceId();

	// Authenticate and get new session
	const { token, inboxId } = await authenticateV2(
		context,
		username,
		password,
		deviceId,
	);

	// Cache the session
	sessionCache.set(username, {
		token,
		inboxId,
		deviceId,
		expiresAt: Date.now() + SESSION_TTL_MS,
	});

	return { token, inboxId, deviceId };
}

/**
 * Clear cached session for a user (useful for logout or on auth errors)
 */
export function clearV2Session(username: string): void {
	sessionCache.delete(username);
}

/**
 * Get the V2 API base URL
 */
export function getV2ApiBase(): string {
	return V2_API_BASE;
}
