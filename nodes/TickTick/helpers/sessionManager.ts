import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";
import * as crypto from "crypto";
import { TICKTICK_URLS } from "../constants/urls";

const V2_API_BASE = `${TICKTICK_URLS.API_BASE_URL}/api/v2`;
const DEFAULT_V2_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const DEFAULT_V2_DEVICE_VERSION = 6430;

function toPythonStyleJson(obj: object): string {
	return JSON.stringify(obj, null, 0).replace(/,/g, ", ").replace(/:/g, ": ");
}

interface SessionCache {
	token: string;
	inboxId: string;
	expiresAt: number;
	deviceId: string;
}

const sessionCache = new Map<string, SessionCache>();

const SESSION_TTL_MS = 23 * 60 * 60 * 1000;

export function generateDeviceId(): string {
	const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
	const random = crypto.randomBytes(8).toString("hex");
	return timestamp + random;
}

export function buildDeviceHeader(
	deviceId: string,
	deviceVersion: number = DEFAULT_V2_DEVICE_VERSION,
): string {
	return toPythonStyleJson({
		platform: "web",
		version: deviceVersion,
		id: deviceId,
	});
}

export function buildV2Headers(
	sessionToken: string,
	deviceId: string,
	userAgent: string = DEFAULT_V2_USER_AGENT,
	deviceVersion: number = DEFAULT_V2_DEVICE_VERSION,
): IDataObject {
	return {
		"User-Agent": userAgent,
		"X-Device": buildDeviceHeader(deviceId, deviceVersion),
		"Cookie": `t=${sessionToken}`,
		"Origin": TICKTICK_URLS.BASE_URL,
		"Referer": `${TICKTICK_URLS.BASE_URL}/`,
	};
}

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

async function authenticateV2(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	username: string,
	password: string,
	deviceId: string,
	userAgent: string,
	deviceVersion: number,
): Promise<{ token: string; inboxId: string }> {
	const bodyJson = toPythonStyleJson({ username, password });

	const signonResponse = await context.helpers.httpRequest({
		method: "POST",
		url: `${V2_API_BASE}/user/signon?wc=true&remember=true`,
		headers: {
			"Accept-Encoding": "identity",
			"User-Agent": userAgent,
			"Content-Type": "application/json",
			"X-Device": buildDeviceHeader(deviceId, deviceVersion),
			"Origin": TICKTICK_URLS.BASE_URL,
			"Referer": `${TICKTICK_URLS.BASE_URL}/`,
		},
		body: bodyJson,
		returnFullResponse: true,
	});

	const responseBody = typeof signonResponse.body === "string"
		? JSON.parse(signonResponse.body)
		: signonResponse.body;

	if (responseBody.authId && !responseBody.token) {
		throw new NodeApiError(
			context.getNode(),
			{
				message:
					"Two-factor authentication is required but not supported. Please disable 2FA or use a different authentication method.",
			} as JsonObject,
		);
	}

	let token = responseBody.token;
	if (!token) {
		const cookies = signonResponse.headers["set-cookie"];
		if (cookies) {
			const authCookies = extractCookies(cookies);
			token = authCookies.t;
		}
	}

	if (!token) {
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

export async function getV2Session(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<{
	token: string;
	inboxId: string;
	deviceId: string;
	userAgent: string;
	deviceVersion: number;
}> {
	const credentials = await context.getCredentials("tickTickSessionApi");
	const username = credentials.username as string;
	const password = credentials.password as string;
	const userAgent = DEFAULT_V2_USER_AGENT;
	const deviceVersion = DEFAULT_V2_DEVICE_VERSION;

	let cached = sessionCache.get(username);

	if (cached && cached.expiresAt > Date.now()) {
		return {
			token: cached.token,
			inboxId: cached.inboxId,
			deviceId: cached.deviceId,
			userAgent,
			deviceVersion,
		};
	}

	const deviceId = cached?.deviceId || generateDeviceId();

	const { token, inboxId } = await authenticateV2(
		context,
		username,
		password,
		deviceId,
		userAgent,
		deviceVersion,
	);

	sessionCache.set(username, {
		token,
		inboxId,
		deviceId,
		expiresAt: Date.now() + SESSION_TTL_MS,
	});

	return { token, inboxId, deviceId, userAgent, deviceVersion };
}

export function clearV2Session(username: string): void {
	sessionCache.delete(username);
}

export function getV2ApiBase(): string {
	return V2_API_BASE;
}
