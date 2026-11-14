import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	JsonObject,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";
import * as crypto from "crypto";
import { TICKTICK_URLS } from "./constants";

const V2_API_BASE = `${TICKTICK_URLS.API_BASE_URL}/api/v2`;
export const DEFAULT_V2_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
// TickTick web client's device version, taken from the X-Device header on ticktick.com.
// An outdated value makes v2 sign-on fail with errorCode "need_upgrade_client" (see #25 / #26).
export const DEFAULT_V2_DEVICE_VERSION = 8240;

export const NEED_UPGRADE_CLIENT_CODE = "need_upgrade_client";
export const NEED_UPGRADE_CLIENT_MESSAGE =
	"TickTick requires a newer client version. Update DEFAULT_V2_DEVICE_VERSION in sessionManager.ts to match the current TickTick web client.";

export function v2SignonFailureMessage(
	errorCode?: string,
	errorMessage?: string,
): string {
	if (errorCode === NEED_UPGRADE_CLIENT_CODE) {
		return NEED_UPGRADE_CLIENT_MESSAGE;
	}
	return errorMessage || "Please check your credentials.";
}

type SignonContext =
	| IExecuteFunctions
	| ILoadOptionsFunctions
	| IHookFunctions
	| IPollFunctions;

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseSignonBody(value: unknown): Record<string, unknown> | undefined {
	let current = value;
	if (typeof current === "string") {
		try {
			current = JSON.parse(current);
		} catch {
			return undefined;
		}
	}
	return isRecord(current) ? current : undefined;
}

function signonCode(record: Record<string, unknown> | undefined): string | undefined {
	if (!record) return undefined;
	if (
		record.errorCode === NEED_UPGRADE_CLIENT_CODE ||
		record.errorId === NEED_UPGRADE_CLIENT_CODE
	) {
		return NEED_UPGRADE_CLIENT_CODE;
	}
	if (typeof record.errorCode === "string") return record.errorCode;
	if (typeof record.errorId === "string") return record.errorId;
	return undefined;
}

function signonMessage(record: Record<string, unknown> | undefined): string | undefined {
	return typeof record?.errorMessage === "string" ? record.errorMessage : undefined;
}

function signonFieldsFromValue(value: unknown): {
	errorCode?: string;
	errorMessage?: string;
} {
	const record = parseSignonBody(value);
	return {
		errorCode: signonCode(record),
		errorMessage: signonMessage(record),
	};
}

function signonFieldsFromThrown(error: unknown): {
	errorCode?: string;
	errorMessage?: string;
} {
	const candidates: unknown[] = [];
	const seen = new Set<unknown>();

	const visit = (value: unknown, depth: number) => {
		if (value == null || depth > 5 || seen.has(value)) return;
		if (typeof value === "string") {
			candidates.push(value);
			return;
		}
		if (!isRecord(value)) return;
		seen.add(value);
		const response = value.response;
		if (isRecord(response)) {
			candidates.push(response.body, response.data);
		}
		candidates.push(value.body, value.data);
		if ("cause" in value) visit(value.cause, depth + 1);
	};

	visit(error, 0);

	for (const candidate of candidates) {
		const fields = signonFieldsFromValue(candidate);
		if (fields.errorCode) return fields;
	}
	return {};
}

function throwNeedUpgradeClient(
	context: SignonContext,
	errorMessage?: string,
): never {
	throw new NodeApiError(context.getNode(), {
		message: v2SignonFailureMessage(NEED_UPGRADE_CLIENT_CODE, errorMessage),
		description: `Error code: ${NEED_UPGRADE_CLIENT_CODE}`,
	} as JsonObject);
}

export function toPythonStyleJson(obj: object): string {
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
	context:
		| IExecuteFunctions
		| ILoadOptionsFunctions
		| IHookFunctions
		| IPollFunctions,
	username: string,
	password: string,
	deviceId: string,
	userAgent: string,
	deviceVersion: number,
): Promise<{ token: string; inboxId: string }> {
	const bodyJson = toPythonStyleJson({ username, password });

	let signonResponse;
	try {
		signonResponse = await context.helpers.httpRequest({
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
	} catch (error) {
		const { errorCode, errorMessage } = signonFieldsFromThrown(error);
		if (errorCode === NEED_UPGRADE_CLIENT_CODE) {
			throwNeedUpgradeClient(context, errorMessage);
		}
		// Keep network and non-upgrade failures as thrown so callers see the original error.
		// eslint-disable-next-line @n8n/community-nodes/require-node-api-error
		throw error;
	}

	const responseBody = typeof signonResponse.body === "string"
		? JSON.parse(signonResponse.body)
		: signonResponse.body;

	if (
		responseBody.errorCode === NEED_UPGRADE_CLIENT_CODE ||
		responseBody.errorId === NEED_UPGRADE_CLIENT_CODE
	) {
		throwNeedUpgradeClient(context, responseBody.errorMessage);
	}

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
					v2SignonFailureMessage(
						responseBody.errorCode,
						responseBody.errorMessage,
					)
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
	context:
		| IExecuteFunctions
		| ILoadOptionsFunctions
		| IHookFunctions
		| IPollFunctions,
): Promise<{
	token: string;
	inboxId: string;
	deviceId: string;
	userAgent: string;
	deviceVersion: number;
	username: string;
}> {
	const credentials = await context.getCredentials("tickTickSessionApi");
	const username = credentials.username as string;
	const password = credentials.password as string;
	const userAgent = DEFAULT_V2_USER_AGENT;
	const deviceVersion = DEFAULT_V2_DEVICE_VERSION;

	const cached = sessionCache.get(username);

	if (cached && cached.expiresAt > Date.now()) {
		return {
			token: cached.token,
			inboxId: cached.inboxId,
			deviceId: cached.deviceId,
			userAgent,
			deviceVersion,
			username,
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

	return { token, inboxId, deviceId, userAgent, deviceVersion, username };
}

export function clearV2Session(username: string): void {
	sessionCache.delete(username);
}

export function getV2ApiBase(): string {
	return V2_API_BASE;
}
