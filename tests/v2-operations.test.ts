import * as dotenv from "dotenv";
import * as https from "https";
import * as http from "http";

// Load environment variables
dotenv.config();

const V2_API_BASE = "https://api.ticktick.com/api/v2";
const V2_USER_AGENT = "Mozilla/5.0 (rv:145.0) Firefox/145.0";
const V2_DEVICE_VERSION = 6430;

interface AuthResponse {
	token?: string;
	inboxId?: string;
	errorMessage?: string;
	errorCode?: string;
	authId?: string;
}

/**
 * Generate a device ID (24 hex chars)
 */
function generateDeviceId(): string {
	const chars = "0123456789abcdef";
	let result = "";
	for (let i = 0; i < 24; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

/**
 * Build the X-Device header
 */
/**
 * Build the X-Device header (minimal format based on ticktick-sdk)
 */
function buildDeviceHeader(deviceId: string): string {
	return JSON.stringify({
		platform: "web",
		version: V2_DEVICE_VERSION,
		id: deviceId,
	});
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
		const match = cookieHeader.match(/^([^=]+)=([^;]+)/);
		if (match) {
			const [, name, value] = match;
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
 * Build cookie header string
 */
function buildCookieHeader(cookies: Record<string, string>): string {
	return Object.entries(cookies)
		.map(([name, value]) => `${name}=${value}`)
		.join("; ");
}

/**
 * Make HTTP request using Node.js built-in https module
 */
function makeRequest(
	url: string,
	options: https.RequestOptions,
	body?: any,
): Promise<
	{ body: any; headers: http.IncomingHttpHeaders; statusCode: number }
> {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(url);
		const requestOptions: https.RequestOptions = {
			...options,
			hostname: urlObj.hostname,
			path: urlObj.pathname + urlObj.search,
			protocol: urlObj.protocol,
		};

		const req = https.request(requestOptions, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => {
				try {
					const parsedBody = data ? JSON.parse(data) : {};
					resolve({
						body: parsedBody,
						headers: res.headers,
						statusCode: res.statusCode || 500,
					});
				} catch {
					resolve({
						body: data,
						headers: res.headers,
						statusCode: res.statusCode || 500,
					});
				}
			});
		});

		req.on("error", reject);

		if (body) {
			req.write(typeof body === "string" ? body : JSON.stringify(body));
		}

		req.end();
	});
}

/**
 * Authenticate and get session token
 */
async function authenticate(): Promise<
	{ token: string; deviceId: string; inboxId: string }
> {
	const username = process.env.TICKTICK_USERNAME;
	const password = process.env.TICKTICK_PASSWORD;
	const deviceId = generateDeviceId();

	if (!username || !password) {
		throw new Error(
			"TICKTICK_USERNAME and TICKTICK_PASSWORD must be set in .env",
		);
	}

	// Step 1: Get session cookie
	const signinResponse = await makeRequest("https://ticktick.com/signin", {
		method: "GET",
		headers: {
			"User-Agent": V2_USER_AGENT,
			"Accept":
				"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		},
	});

	const sessionCookies = extractCookies(
		signinResponse.headers["set-cookie"] || [],
	);

	// Step 2: Authenticate
	const signonResponse = await makeRequest(
		`${V2_API_BASE}/user/signon?wc=true&remember=true`,
		{
			method: "POST",
			headers: {
				"User-Agent": V2_USER_AGENT,
				"Content-Type": "application/json",
				"X-Device": buildDeviceHeader(deviceId),
				"X-Requested-With": "XMLHttpRequest",
				"Origin": "https://ticktick.com",
				"Referer": "https://ticktick.com/",
				"Cookie": buildCookieHeader(sessionCookies),
			},
		},
		{ username, password },
	);

	const authBody = signonResponse.body as AuthResponse;

	if (authBody.errorMessage) {
		throw new Error(`Authentication failed: ${authBody.errorMessage}`);
	}

	const token = authBody.token ||
		extractCookies(signonResponse.headers["set-cookie"] || []).t;

	if (!token) {
		throw new Error("Failed to obtain authentication token");
	}

	return {
		token,
		deviceId,
		inboxId: authBody.inboxId || "",
	};
}

/**
 * Make authenticated V2 API request
 */
async function makeV2Request(
	endpoint: string,
	token: string,
	deviceId: string,
	method: string = "GET",
	body?: any,
): Promise<any> {
	const response = await makeRequest(`${V2_API_BASE}${endpoint}`, {
		method,
		headers: {
			"User-Agent": V2_USER_AGENT,
			"X-Device": buildDeviceHeader(deviceId),
			"Cookie": `t=${token}`,
			"Content-Type": "application/json",
		},
	}, body);

	if (response.statusCode >= 400) {
		throw new Error(
			`API request failed: ${response.statusCode} - ${
				JSON.stringify(response.body)
			}`,
		);
	}

	return response.body;
}

describe("TickTick V2 API Operations", () => {
	let authData: { token: string; deviceId: string; inboxId: string };

	beforeAll(async () => {
		console.log("Authenticating...");
		authData = await authenticate();
		console.log("✓ Authentication successful");
		console.log("  Token:", authData.token.substring(0, 20) + "...");
		console.log("  Device ID:", authData.deviceId);
		console.log("  Inbox ID:", authData.inboxId);
	}, 20000);

	test("GET /user/preferences - Get user preferences", async () => {
		const preferences = await makeV2Request(
			"/user/preferences",
			authData.token,
			authData.deviceId,
		);

		console.log("User preferences:", JSON.stringify(preferences, null, 2));

		expect(preferences).toBeDefined();
		expect(typeof preferences).toBe("object");
	}, 10000);

	test("GET /user/profile - Get user profile", async () => {
		const profile = await makeV2Request(
			"/user/profile",
			authData.token,
			authData.deviceId,
		);

		console.log("User profile:", JSON.stringify(profile, null, 2));

		expect(profile).toBeDefined();
		expect(typeof profile).toBe("object");
	}, 10000);

	test("GET /batch/check/0 - Sync endpoint (initial sync)", async () => {
		const syncData = await makeV2Request(
			"/batch/check/0",
			authData.token,
			authData.deviceId,
		);

		console.log("Sync data keys:", Object.keys(syncData));

		expect(syncData).toBeDefined();
		expect(typeof syncData).toBe("object");

		// Common sync response fields based on the SDK
		if (syncData.projectProfiles) {
			console.log("  Projects count:", syncData.projectProfiles.length);
		}
		if (syncData.syncTaskBean?.update) {
			console.log("  Tasks count:", syncData.syncTaskBean.update.length);
		}
		if (syncData.tags) {
			console.log("  Tags count:", syncData.tags.length);
		}
	}, 10000);

	test("GET /projects - List all projects", async () => {
		const projects = await makeV2Request(
			"/projects",
			authData.token,
			authData.deviceId,
		);

		console.log("Projects response:", JSON.stringify(projects, null, 2));

		expect(projects).toBeDefined();
		expect(Array.isArray(projects) || typeof projects === "object").toBe(true);
	}, 10000);

	test("GET /tags - List all tags", async () => {
		const tags = await makeV2Request(
			"/tags",
			authData.token,
			authData.deviceId,
		);

		console.log("Tags response:", JSON.stringify(tags, null, 2));

		expect(tags).toBeDefined();
		expect(Array.isArray(tags) || typeof tags === "object").toBe(true);
	}, 10000);

	test("GET /habits - List all habits", async () => {
		const habits = await makeV2Request(
			"/habits",
			authData.token,
			authData.deviceId,
		);

		console.log("Habits response:", JSON.stringify(habits, null, 2));

		expect(habits).toBeDefined();
		expect(Array.isArray(habits) || typeof habits === "object").toBe(true);
	}, 10000);
});
