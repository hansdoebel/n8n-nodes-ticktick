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
		os: "macOS 10.15",
		device: "Firefox 146.0",
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
 * Build cookie header string from cookie object
 */
function buildCookieHeader(cookies: Record<string, string>): string {
	return Object.entries(cookies)
		.map(([name, value]) => `${name}=${value}`)
		.join("; ");
}

/**
 * Authenticate with TickTick V2 API using browser-like flow
 * Step 1: GET /signin to establish session
 * Step 2: POST /api/v2/user/signon with session cookies
 * Step 3: Extract authentication token
 */
async function authenticateV2(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	username: string,
	password: string,
	deviceId: string,
): Promise<{ token: string; inboxId: string }> {
	// STEP 1: GET /signin to establish SESSION cookie (like browser does)
	const signinResponse = await context.helpers.httpRequest({
		method: "GET",
		url: "https://ticktick.com/signin",
		headers: {
			"User-Agent": V2_USER_AGENT,
			"Accept":
				"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.9",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
		},
		returnFullResponse: true,
		skipSslCertificateValidation: false,
	});

	// Extract cookies from initial signin page
	const initialCookies: Record<string, string> = {};
	if (signinResponse.headers["set-cookie"]) {
		Object.assign(
			initialCookies,
			extractCookies(signinResponse.headers["set-cookie"]),
		);
	}

	// STEP 2: POST /api/v2/user/signon with SESSION cookie (like browser does)
	const signonResponse = await context.helpers.httpRequest({
		method: "POST",
		url: `${V2_API_BASE}/user/signon?wc=true&remember=true`,
		headers: {
			"User-Agent": V2_USER_AGENT,
			"Accept": "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			"X-Device": buildDeviceHeader(deviceId),
			"X-Requested-With": "XMLHttpRequest",
			"Origin": "https://ticktick.com",
			"Referer": "https://ticktick.com/",
			// Include session cookies from step 1
			"Cookie": buildCookieHeader(initialCookies),
		},
		body: {
			username,
			password,
		},
		json: true,
		returnFullResponse: true,
	});

	// Check if 2FA is required
	if (signonResponse.body.authId && !signonResponse.body.token) {
		throw new NodeApiError(
			context.getNode(),
			{
				message:
					"Two-factor authentication is required but not supported. Please disable 2FA or use a different authentication method.",
			} as JsonObject,
		);
	}

	// STEP 3: Extract token from response body or cookies
	let token = signonResponse.body.token;
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
		const errorData = signonResponse.body;
		throw new NodeApiError(
			context.getNode(),
			{
				message: `Failed to obtain session token from TickTick. ${
					errorData.errorMessage || "Please check your credentials."
				}`,
				description: errorData.errorCode
					? `Error code: ${errorData.errorCode}`
					: undefined,
			} as JsonObject,
		);
	}

	const inboxId = signonResponse.body.inboxId || "";

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
