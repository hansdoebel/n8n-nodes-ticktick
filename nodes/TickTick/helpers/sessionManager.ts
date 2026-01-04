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
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0";
const V2_DEVICE_VERSION = 6440;

/**
 * Convert object to JSON with spaces after colons and commas (Python-style)
 * TickTick's V2 API expects this format - compact JSON without spaces fails!
 * This matches Python's json.dumps() default formatting.
 */
function toPythonStyleJson(obj: object): string {
	return JSON.stringify(obj, null, 0).replace(/,/g, ", ").replace(/:/g, ": ");
}

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
 * Uses minimal format (platform, version, id) with Python-style JSON spacing
 */
export function buildDeviceHeader(deviceId: string): string {
	return toPythonStyleJson({
		platform: "web",
		version: V2_DEVICE_VERSION,
		id: deviceId,
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
	};
}

/**
 * Extract cookies from Set-Cookie headers
 */
function extractCookies(
	setCookieHeaders: string | string[],
): Record<string, string> {
	const cookies: Record<string, string> = {};
	const cookieArray = Array.isArray(setCookieHeaders)
		? setCookieHeaders
		: [setCookieHeaders];

	for (const cookieHeader of cookieArray) {
		// Extract cookie name=value (before first semicolon)
		const match = cookieHeader.match(/^([^=]+)=([^;]+)/);
		if (match) {
			const [, name, value] = match;
			// Skip empty cookies or deletion cookies
			if (
				value && value !== '""' &&
				!cookieHeader.includes("Expires=Thu, 01 Jan 1970")
			) {
				cookies[name] = value;
			}
		}
	}

	return cookies;
}

/**
 * Authenticate with TickTick V2 API
 * Direct POST to /signon with Python-style JSON formatting
 *
 * IMPORTANT: TickTick's V2 API requires JSON with spaces after colons and commas
 * (Python's json.dumps() style). Compact JSON without spaces fails with
 * "username_password_not_match" error even with correct credentials!
 */
async function authenticateV2(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	username: string,
	password: string,
	deviceId: string,
): Promise<{ token: string; inboxId: string }> {
	// Prepare body with Python-style JSON formatting (spaces after : and ,)
	const bodyJson = toPythonStyleJson({ username, password });

	// Direct POST to signon endpoint
	// IMPORTANT: Accept-Encoding: identity is required - matches Python's urllib behavior
	const signonResponse = await context.helpers.httpRequest({
		method: "POST",
		url: `${V2_API_BASE}/user/signon?wc=true&remember=true`,
		headers: {
			"Accept-Encoding": "identity",
			"User-Agent": V2_USER_AGENT,
			"Content-Type": "application/json",
			"X-Device": buildDeviceHeader(deviceId),
		},
		body: bodyJson,
		returnFullResponse: true,
	});

	// Parse response body (may be string or already parsed object)
	const responseBody = typeof signonResponse.body === "string"
		? JSON.parse(signonResponse.body)
		: signonResponse.body;

	// Check if 2FA is required
	if (responseBody.authId && !responseBody.token) {
		throw new NodeApiError(
			context.getNode(),
			{
				message:
					"Two-factor authentication is required but not supported. Please disable 2FA or use a different authentication method.",
			} as JsonObject,
		);
	}

	// Extract token from response body or cookies
	let token = responseBody.token;
	if (!token) {
		// Try to get from Set-Cookie header
		const cookies = signonResponse.headers["set-cookie"];
		if (cookies) {
			const authCookies = extractCookies(cookies);
			token = authCookies.t;
		}
	}

	if (!token) {
		// Provide detailed error for debugging
		throw new NodeApiError(
			context.getNode(),
			{
				message: `Failed to obtain session token from TickTick. ${
					responseBody.errorMessage || "Please check your credentials."
				}`,
				description: responseBody.errorCode
					? `Error code: ${responseBody.errorCode}`
					: undefined,
			} as JsonObject,
		);
	}

	const inboxId = responseBody.inboxId || "";

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
