import * as dotenv from "dotenv";
import * as https from "https";
import * as crypto from "crypto";

// Load environment variables
dotenv.config();

const V2_USER_AGENT = "Mozilla/5.0 (rv:145.0) Firefox/145.0";
const V2_DEVICE_VERSION = 6430;

/**
 * Convert object to JSON with spaces after colons and commas (Python-style)
 * TickTick's V2 API requires this format - compact JSON fails!
 */
function toPythonStyleJson(obj: object): string {
	return JSON.stringify(obj, null, 0).replace(/,/g, ", ").replace(/:/g, ": ");
}

interface AuthResponse {
	token?: string;
	inboxId?: string;
	userId?: string;
	errorMessage?: string;
	errorCode?: string;
	authId?: string;
}

/**
 * Generate a MongoDB-style ObjectId (24 hex chars) like Python does
 * Format: 4-byte timestamp + 8-byte random
 */
function generateObjectId(): string {
	const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
	const random = crypto.randomBytes(8).toString("hex");
	return timestamp + random;
}

/**
 * Build the X-Device header with Python-style JSON
 */
function buildDeviceHeader(deviceId: string): string {
	return toPythonStyleJson({
		platform: "web",
		version: V2_DEVICE_VERSION,
		id: deviceId,
	});
}

/**
 * Make HTTP request matching Python's urllib behavior exactly
 */
function makeAuthRequest(
	username: string,
	password: string,
	deviceId: string,
): Promise<{ body: AuthResponse; statusCode: number }> {
	return new Promise((resolve, reject) => {
		const bodyJson = toPythonStyleJson({ username, password });
		const xDevice = buildDeviceHeader(deviceId);

		const options: https.RequestOptions = {
			hostname: "api.ticktick.com",
			path: "/api/v2/user/signon?wc=true&remember=true",
			method: "POST",
			headers: {
				"User-Agent": V2_USER_AGENT,
				"X-Device": xDevice,
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(bodyJson),
			},
		};

		const req = https.request(options, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => {
				try {
					const parsedBody = data ? JSON.parse(data) : {};
					resolve({
						body: parsedBody,
						statusCode: res.statusCode || 500,
					});
				} catch {
					resolve({
						body: { errorMessage: data } as AuthResponse,
						statusCode: res.statusCode || 500,
					});
				}
			});
		});

		req.on("error", reject);
		req.write(bodyJson);
		req.end();
	});
}

describe("TickTick V2 Authentication", () => {
	const username = process.env.TICKTICK_USERNAME;
	const password = process.env.TICKTICK_PASSWORD;

	beforeAll(() => {
		if (!username || !password) {
			throw new Error(
				"Please create a .env file with TICKTICK_USERNAME and TICKTICK_PASSWORD",
			);
		}
	});

	test("authenticates with TickTick V2 API", async () => {
		// Generate fresh ObjectId-style device ID (like Python does)
		const deviceId = generateObjectId();

		console.log("Testing authentication...");
		console.log("Username:", username);
		console.log("Device ID:", deviceId);

		const response = await makeAuthRequest(username!, password!, deviceId);

		console.log("Response status:", response.statusCode);

		// Check for rate limiting
		if (response.body.errorCode === "incorrect_password_too_many_times") {
			console.log(
				"⚠️  Account temporarily locked. Wait 15-30 minutes and try again.",
			);
			// Skip test instead of failing
			return;
		}

		// Log error details if present
		if (response.body.errorCode) {
			console.error("Error code:", response.body.errorCode);
			console.error("Error message:", response.body.errorMessage);
		}

		// Check for 2FA requirement
		if (response.body.authId && !response.body.token) {
			throw new Error(
				"Two-factor authentication is enabled. Please disable it for testing.",
			);
		}

		expect(response.statusCode).toBe(200);
		expect(response.body.token).toBeDefined();
		expect(response.body.inboxId).toBeDefined();
		expect(response.body.userId).toBeDefined();

		console.log("✓ Authentication successful!");
		console.log("  Token:", response.body.token?.substring(0, 30) + "...");
		console.log("  Inbox ID:", response.body.inboxId);
		console.log("  User ID:", response.body.userId);
	}, 30000);
});
