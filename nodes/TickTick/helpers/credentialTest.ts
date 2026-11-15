import type {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IHttpRequestOptions,
	INodeCredentialTestResult,
} from "n8n-workflow";
import { TICKTICK_URLS } from "./constants";
import {
	buildDeviceHeader,
	DEFAULT_V2_USER_AGENT,
	generateDeviceId,
	NEED_UPGRADE_CLIENT_CODE,
	toPythonStyleJson,
	v2SignonFailureMessage,
} from "./sessionManager";

export const CREDENTIAL_TEST_TIMEOUT_MS = 15_000;

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

function signonErrorFields(parsed: Record<string, unknown>): {
	errorCode?: string;
	errorMessage?: string;
} {
	const errorCode =
		parsed.errorCode === NEED_UPGRADE_CLIENT_CODE ||
		parsed.errorId === NEED_UPGRADE_CLIENT_CODE
			? NEED_UPGRADE_CLIENT_CODE
			: typeof parsed.errorCode === "string"
				? parsed.errorCode
				: typeof parsed.errorId === "string"
					? parsed.errorId
					: undefined;
	const errorMessage =
		typeof parsed.errorMessage === "string" ? parsed.errorMessage : undefined;
	return { errorCode, errorMessage };
}

function safeMessage(message: string, password: string): string {
	if (password && message.includes(password)) return "Authentication failed";
	return message;
}

function readSignonHttpResult(response: unknown): {
	statusCode: number;
	rawBody: string;
} {
	if (isRecord(response) && "statusCode" in response) {
		const statusCode = Number(response.statusCode);
		const body = response.body;
		const rawBody = typeof body === "string"
			? body
			: body == null
				? ""
				: JSON.stringify(body);
		return {
			statusCode: Number.isFinite(statusCode) ? statusCode : 0,
			rawBody,
		};
	}

	if (typeof response === "string") {
		return { statusCode: 200, rawBody: response };
	}

	if (isRecord(response)) {
		return { statusCode: 200, rawBody: JSON.stringify(response) };
	}

	return { statusCode: 0, rawBody: "" };
}

type CredentialTestHelpers = {
	httpRequest(requestOptions: IHttpRequestOptions): Promise<unknown>;
};

async function requestSignon(
	this: ICredentialTestFunctions,
	url: string,
	headers: Record<string, string>,
	body: string,
): Promise<{ statusCode: number; rawBody: string }> {
	const helpers = this.helpers as Partial<CredentialTestHelpers> | undefined;
	// httpRequest uses n8n's proxy and CA settings. ignoreHttpStatusErrors keeps
	// TickTick's 4xx body available so the password never rides out on a thrown error.
	if (typeof helpers?.httpRequest === "function") {
		const response = await (this.helpers as unknown as CredentialTestHelpers).httpRequest({
			method: "POST",
			url,
			headers,
			body,
			timeout: CREDENTIAL_TEST_TIMEOUT_MS,
			json: false,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
		});
		return readSignonHttpResult(response);
	}

	const response = await fetch(url, {
		method: "POST",
		headers,
		body,
		signal: AbortSignal.timeout(CREDENTIAL_TEST_TIMEOUT_MS),
	});
	return { statusCode: response.status, rawBody: await response.text() };
}

function parseSignonPayload(rawBody: string):
	| { ok: true; parsed: Record<string, unknown> }
	| { ok: false; message: string } {
	if (!rawBody) return { ok: true, parsed: {} };
	try {
		const value: unknown = JSON.parse(rawBody);
		if (!isRecord(value)) {
			return {
				ok: false,
				message: "TickTick sign-on returned an unexpected response",
			};
		}
		return { ok: true, parsed: value };
	} catch {
		return {
			ok: false,
			message: "TickTick sign-on returned an unexpected response",
		};
	}
}

export async function testTickTickSessionApi(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	const data = credential.data as
		| { username?: string; password?: string }
		| undefined;
	const username = data?.username;
	const password = data?.password;

	if (!username || !password) {
		return { status: "Error", message: "Email and password are required" };
	}

	const xDevice = buildDeviceHeader(generateDeviceId());
	const body = toPythonStyleJson({ username, password });

	try {
		const { statusCode, rawBody } = await requestSignon.call(
			this,
			`${TICKTICK_URLS.API_BASE_URL}/api/v2/user/signon?wc=true&remember=true`,
			{
				"Accept-Encoding": "identity",
				"User-Agent": DEFAULT_V2_USER_AGENT,
				"Content-Type": "application/json",
				"X-Device": xDevice,
				Origin: TICKTICK_URLS.BASE_URL,
				Referer: `${TICKTICK_URLS.BASE_URL}/`,
			},
			body,
		);

		const parsedResult = parseSignonPayload(rawBody);
		if (!parsedResult.ok) {
			return { status: "Error", message: safeMessage(parsedResult.message, password) };
		}
		const parsed = parsedResult.parsed;
		const { errorCode, errorMessage } = signonErrorFields(parsed);

		if (statusCode >= 400 || statusCode === 0) {
			return {
				status: "Error",
				message: safeMessage(
					errorCode === NEED_UPGRADE_CLIENT_CODE
						? v2SignonFailureMessage(errorCode, errorMessage)
						: errorMessage ||
							(statusCode
								? `Authentication failed (HTTP ${statusCode})`
								: "Authentication failed"),
					password,
				),
			};
		}

		if (parsed?.authId && !parsed?.token) {
			return {
				status: "Error",
				message: "Two-factor authentication is required but not supported.",
			};
		}

		if (!parsed?.token) {
			return {
				status: "Error",
				message: safeMessage(
					errorCode === NEED_UPGRADE_CLIENT_CODE
						? v2SignonFailureMessage(errorCode, errorMessage)
						: errorMessage ||
							"Authentication failed. Please check your credentials.",
					password,
				),
			};
		}

		return { status: "OK", message: "Authentication successful" };
	} catch (error) {
		const err = error as { message?: string };
		return {
			status: "Error",
			message: safeMessage(err?.message || "Authentication failed", password),
		};
	}
}
