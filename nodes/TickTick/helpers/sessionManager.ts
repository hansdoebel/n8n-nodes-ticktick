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

function readHttpStatus(error: unknown): number | undefined {
	const seen = new Set<unknown>();

	const visit = (value: unknown, depth: number): number | undefined => {
		if (!isRecord(value) || depth > 5 || seen.has(value)) return undefined;
		seen.add(value);

		for (const key of ["statusCode", "status", "httpCode"] as const) {
			const raw = value[key];
			if (typeof raw === "number" && raw >= 100 && raw < 600) return raw;
			if (typeof raw === "string" && /^\d{3}$/.test(raw)) {
				const code = Number(raw);
				if (code >= 100 && code < 600) return code;
			}
		}

		if (isRecord(value.response)) {
			const fromResponse = visit(value.response, depth + 1);
			if (fromResponse !== undefined) return fromResponse;
		}
		if ("cause" in value) {
			const fromCause = visit(value.cause, depth + 1);
			if (fromCause !== undefined) return fromCause;
		}
		return undefined;
	};

	return visit(error, 0);
}

function stringField(
	record: Record<string, unknown>,
	key: string,
): string | undefined {
	return typeof record[key] === "string" ? record[key] : undefined;
}

function throwSignonApiError(
	context: SignonContext,
	statusCode: number | undefined,
	errorCode: string | undefined,
	errorMessage: string | undefined,
): never {
	const message = errorMessage
		? v2SignonFailureMessage(errorCode, errorMessage)
		: statusCode
			? `TickTick sign-on failed (HTTP ${statusCode})`
			: "TickTick sign-on request failed";
	const description = errorCode ? `Error code: ${errorCode}` : undefined;
	const payload: JsonObject = { message };
	if (description) payload.description = description;

	throw new NodeApiError(context.getNode(), payload, {
		message,
		description,
		httpCode: statusCode ? String(statusCode) : undefined,
	});
}

function parseSignonResponseBody(
	context: SignonContext,
	body: unknown,
): Record<string, unknown> {
	let parsed: unknown = body;
	if (typeof body === "string") {
		try {
			parsed = JSON.parse(body);
		} catch {
			throw new NodeApiError(context.getNode(), {
				message: "TickTick sign-on returned an unexpected response",
				description: "The response was not valid JSON.",
			} as JsonObject);
		}
	}

	if (!isRecord(parsed)) {
		throw new NodeApiError(context.getNode(), {
			message: "TickTick sign-on returned an unexpected response",
			description: "The response was not a JSON object.",
		} as JsonObject);
	}

	return parsed;
}

export function toPythonStyleJson(obj: object): string {
	return JSON.stringify(obj, null, 0).replace(/,/g, ", ").replace(/:/g, ": ");
}

interface SessionCacheEntry {
	token: string;
	inboxId: string;
	expiresAt: number;
	deviceId: string;
	email: string;
}

interface FailureCacheEntry {
	expiresAt: number;
	email: string;
	message: string;
	description?: string;
	httpCode?: string;
}

type V2Session = {
	token: string;
	inboxId: string;
	deviceId: string;
	userAgent: string;
	deviceVersion: number;
	username: string;
};

const sessionCache = new Map<string, SessionCacheEntry>();
const failureCache = new Map<string, FailureCacheEntry>();
const inflightLogins = new Map<string, Promise<V2Session>>();

let clock: () => number = Date.now;

function nowMs(): number {
	return clock();
}

/** @internal Test hook. Omit the clock to restore Date.now. */
export function _setV2SessionClockForTests(next?: () => number): void {
	clock = next ?? Date.now;
}

export const V2_SESSION_TTL_MS = 23 * 60 * 60 * 1000;
export const V2_LOGIN_FAILURE_TTL_MS = 10 * 60 * 1000;
export const V2_TRANSIENT_FAILURE_TTL_MS = 30 * 1000;
const MAX_CACHE_ENTRIES = 256;

function normalizeEmail(email: string | undefined): string {
	return (email ?? "").trim().toLowerCase();
}

function sessionCacheKey(email: string, password: string): string {
	return crypto
		.createHash("sha256")
		.update(`${normalizeEmail(email)}\0${password}`, "utf8")
		.digest("hex");
}

function trimCacheToSize<T extends { expiresAt: number }>(
	cache: Map<string, T>,
	maxEntries: number,
): void {
	if (cache.size <= maxEntries) return;
	const oldestFirst = [...cache.entries()].sort(
		(a, b) => a[1].expiresAt - b[1].expiresAt,
	);
	while (cache.size > maxEntries && oldestFirst.length > 0) {
		const next = oldestFirst.shift();
		if (next) cache.delete(next[0]);
	}
}

function evictExpiredCacheEntries(now = nowMs()): void {
	for (const [key, entry] of sessionCache) {
		if (entry.expiresAt <= now) sessionCache.delete(key);
	}
	for (const [key, entry] of failureCache) {
		if (entry.expiresAt <= now) failureCache.delete(key);
	}
	trimCacheToSize(sessionCache, MAX_CACHE_ENTRIES);
	trimCacheToSize(failureCache, MAX_CACHE_ENTRIES);
}

export function getV2SessionCacheStats(): {
	sessions: number;
	failures: number;
} {
	return { sessions: sessionCache.size, failures: failureCache.size };
}

function isCredentialRejection(
	httpCode: string | undefined,
	description: string | undefined,
): boolean {
	const status = Number(httpCode);
	if (status === 401 || status === 403) return true;
	const errorCode = description?.match(/Error code:\s*(\S+)/)?.[1]?.toLowerCase();
	if (!errorCode) return false;
	return errorCode.includes("password");
}

function cacheSignonFailure(key: string, email: string, error: unknown): void {
	const safe = error instanceof NodeApiError
		? {
			message: error.message || "TickTick sign-on request failed",
			description: error.description || undefined,
			httpCode: error.httpCode || undefined,
		}
		: {
			message: "TickTick sign-on request failed",
			description: undefined,
			httpCode: undefined,
		};
	const ttl = isCredentialRejection(safe.httpCode, safe.description)
		? V2_LOGIN_FAILURE_TTL_MS
		: V2_TRANSIENT_FAILURE_TTL_MS;

	failureCache.set(key, {
		expiresAt: nowMs() + ttl,
		email,
		message: safe.message,
		description: safe.description,
		httpCode: safe.httpCode,
	});
	trimCacheToSize(failureCache, MAX_CACHE_ENTRIES);
}

function throwCachedSignonFailure(
	context: SignonContext,
	failure: FailureCacheEntry,
): never {
	const payload: JsonObject = { message: failure.message };
	if (failure.description) payload.description = failure.description;
	throw new NodeApiError(context.getNode(), payload, {
		message: failure.message,
		description: failure.description,
		httpCode: failure.httpCode,
	});
}

function dropSessionsForEmail(email: string, keepKey?: string): void {
	for (const [key, entry] of sessionCache) {
		if (entry.email === email && key !== keepKey) sessionCache.delete(key);
	}
}

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
		throwSignonApiError(
			context,
			readHttpStatus(error),
			errorCode,
			errorMessage,
		);
	}

	const responseBody = parseSignonResponseBody(context, signonResponse.body);
	const errorCode = stringField(responseBody, "errorCode") ??
		stringField(responseBody, "errorId");
	const errorMessage = stringField(responseBody, "errorMessage");

	if (
		responseBody.errorCode === NEED_UPGRADE_CLIENT_CODE ||
		responseBody.errorId === NEED_UPGRADE_CLIENT_CODE
	) {
		throwNeedUpgradeClient(context, errorMessage);
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

	let token = stringField(responseBody, "token");
	if (!token) {
		const cookies = signonResponse.headers?.["set-cookie"];
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
					v2SignonFailureMessage(errorCode, errorMessage)
				}`,
				description: errorCode ? `Error code: ${errorCode}` : undefined,
			} as JsonObject,
		);
	}

	const inboxId = stringField(responseBody, "inboxId") || "";

	return { token, inboxId };
}

export async function getV2Session(context: SignonContext): Promise<V2Session> {
	const credentials = await context.getCredentials("tickTickSessionApi");
	const username = credentials.username as string;
	const password = (credentials.password as string) ?? "";
	const userAgent = DEFAULT_V2_USER_AGENT;
	const deviceVersion = DEFAULT_V2_DEVICE_VERSION;
	const email = normalizeEmail(username);
	const cacheKey = sessionCacheKey(username ?? "", password);
	const now = nowMs();
	const existing = sessionCache.get(cacheKey);

	if (existing && existing.expiresAt > now) {
		evictExpiredCacheEntries(now);
		return {
			token: existing.token,
			inboxId: existing.inboxId,
			deviceId: existing.deviceId,
			userAgent,
			deviceVersion,
			username,
		};
	}

	const deviceId = existing?.deviceId || generateDeviceId();
	evictExpiredCacheEntries(now);

	const cachedFailure = failureCache.get(cacheKey);
	if (cachedFailure && cachedFailure.expiresAt > now) {
		throwCachedSignonFailure(context, cachedFailure);
	}

	const inflight = inflightLogins.get(cacheKey);
	if (inflight) return inflight;

	const login = (async (): Promise<V2Session> => {
		try {
			const { token, inboxId } = await authenticateV2(
				context,
				username,
				password,
				deviceId,
				userAgent,
				deviceVersion,
			);
			sessionCache.set(cacheKey, {
				token,
				inboxId,
				deviceId,
				email,
				expiresAt: nowMs() + V2_SESSION_TTL_MS,
			});
			failureCache.delete(cacheKey);
			dropSessionsForEmail(email, cacheKey);
			trimCacheToSize(sessionCache, MAX_CACHE_ENTRIES);
			return {
				token,
				inboxId,
				deviceId,
				userAgent,
				deviceVersion,
				username,
			};
		} catch (error) {
			cacheSignonFailure(cacheKey, email, error);
			const failure = failureCache.get(cacheKey);
			if (failure) throwCachedSignonFailure(context, failure);
			throw new NodeApiError(context.getNode(), {
				message: "TickTick sign-on request failed",
			} as JsonObject);
		}
	})();

	inflightLogins.set(cacheKey, login);
	try {
		return await login;
	} finally {
		if (inflightLogins.get(cacheKey) === login) {
			inflightLogins.delete(cacheKey);
		}
	}
}

export function clearV2Session(username: string): void {
	const email = normalizeEmail(username);
	dropSessionsForEmail(email);
	for (const [key, entry] of failureCache) {
		if (entry.email === email) failureCache.delete(key);
	}
}

export function getV2ApiBase(): string {
	return V2_API_BASE;
}
