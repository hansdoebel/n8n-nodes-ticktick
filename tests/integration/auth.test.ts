import { beforeAll, describe, expect, test } from "bun:test";
import {
	API_BASE,
	buildDeviceHeader,
	generateObjectId,
	toPythonStyleJson,
	V2_USER_AGENT,
} from "./utils/testClient";
import { TICKTICK_URLS } from "../../nodes/TickTick/constants/urls";

interface AuthResponse {
	token?: string;
	inboxId?: string;
	userId?: string;
	errorMessage?: string;
	errorCode?: string;
	authId?: string;
}

async function makeAuthRequest(
	username: string,
	password: string,
	deviceId: string,
): Promise<{ body: AuthResponse; statusCode: number }> {
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

	const body = await response.json() as AuthResponse;

	return {
		body,
		statusCode: response.status,
	};
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
		const deviceId = generateObjectId();

		console.log("Testing authentication...");
		console.log("Username:", username);
		console.log("Device ID:", deviceId);

		const response = await makeAuthRequest(username!, password!, deviceId);

		console.log("Response status:", response.statusCode);

		if (response.body.errorCode === "incorrect_password_too_many_times") {
			console.log(
				"⚠️  Account temporarily locked. Wait 15-30 minutes and try again.",
			);
			return;
		}

		if (response.body.errorCode) {
			console.error("Error code:", response.body.errorCode);
			console.error("Error message:", response.body.errorMessage);
		}

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
