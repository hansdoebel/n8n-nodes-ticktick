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
	redactCredentialSecrets,
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

function containsPassword(text: string, password: string): boolean {
	if (!password || !text) return false;
	if (text.includes(password)) return true;
	const encoded = encodeURIComponent(password);
	return encoded !== password && text.includes(encoded);
}

function withErrorCode(text: string, errorCode: string | undefined, username: string): string {
	if (!errorCode) return text;
	const safeCode = redactCredentialSecrets(errorCode, [username], []).trim();
	if (!safeCode || text.includes(safeCode)) return text;
	return `${text} Error code: ${safeCode}`;
}

function presentedSignonMessage(
	statusCode: number,
	errorCode: string | undefined,
	errorMessage: string | undefined,
	username: string,
	password: string,
	fallback: string,
): string {
	if (errorCode === NEED_UPGRADE_CLIENT_CODE) {
		return v2SignonFailureMessage(errorCode);
	}
	const raw = (errorMessage ?? "").trim();
	if (containsPassword(raw, password)) {
		return withErrorCode(fallback, errorCode, username);
	}
	const scrubbed = redactCredentialSecrets(raw, [username], [password]).trim();
	const removedSecret = scrubbed !== raw;
	if (scrubbed && /[a-z0-9]/i.test(scrubbed) && !removedSecret) {
		return scrubbed;
	}
	if (scrubbed && /[a-z0-9]/i.test(scrubbed)) {
		const statusBit = statusCode ? ` (HTTP ${statusCode})` : "";
		return withErrorCode(`${scrubbed}${statusBit}`, errorCode, username);
	}
	return withErrorCode(fallback, errorCode, username);
}

function safeThrownMessage(message: string, username: string, password: string): string {
	if (containsPassword(message, password)) return "Authentication failed";
	const scrubbed = redactCredentialSecrets(message, [username], [password]).trim();
	if (!scrubbed || !/[a-z0-9]/i.test(scrubbed)) return "Authentication failed";
	return scrubbed;
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
			return {
				status: "Error",
				message: safeThrownMessage(parsedResult.message, username, password),
			};
		}
		const parsed = parsedResult.parsed;
		const { errorCode, errorMessage } = signonErrorFields(parsed);

		if (statusCode >= 400 || statusCode === 0) {
			return {
				status: "Error",
				message: presentedSignonMessage(
					statusCode,
					errorCode,
					errorMessage,
					username,
					password,
					statusCode
						? `Authentication failed (HTTP ${statusCode})`
						: "Authentication failed",
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
				message: presentedSignonMessage(
					statusCode,
					errorCode,
					errorMessage,
					username,
					password,
					"Authentication failed. Please check your credentials.",
				),
			};
		}

		return { status: "OK", message: "Authentication successful" };
	} catch (error) {
		const err = error as { message?: string };
		return {
			status: "Error",
			message: safeThrownMessage(
				err?.message || "Authentication failed",
				username,
				password,
			),
		};
	}
}
