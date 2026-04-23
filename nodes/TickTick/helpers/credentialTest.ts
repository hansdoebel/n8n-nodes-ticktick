import type {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
} from "n8n-workflow";
import { TICKTICK_URLS } from "./constants";
import {
	buildDeviceHeader,
	DEFAULT_V2_USER_AGENT,
	generateDeviceId,
	toPythonStyleJson,
} from "./sessionManager";

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
		const response = await fetch(
			`${TICKTICK_URLS.API_BASE_URL}/api/v2/user/signon?wc=true&remember=true`,
			{
				method: "POST",
				headers: {
					"Accept-Encoding": "identity",
					"User-Agent": DEFAULT_V2_USER_AGENT,
					"Content-Type": "application/json",
					"X-Device": xDevice,
					Origin: TICKTICK_URLS.BASE_URL,
					Referer: `${TICKTICK_URLS.BASE_URL}/`,
				},
				body,
			},
		);

		const statusCode = response.status;
		const rawBody = await response.text();
		const parsed = rawBody
			? (JSON.parse(rawBody) as Record<string, unknown>)
			: ({} as Record<string, unknown>);

		if (statusCode >= 400) {
			return {
				status: "Error",
				message:
					(parsed?.errorMessage as string) ||
					`Authentication failed (HTTP ${statusCode})`,
			};
		}

		if (parsed?.authId && !parsed?.token) {
			return {
				status: "Error",
				message:
					"Two-factor authentication is required but not supported.",
			};
		}

		if (!parsed?.token) {
			return {
				status: "Error",
				message:
					(parsed?.errorMessage as string) ||
					"Authentication failed. Please check your credentials.",
			};
		}

		return { status: "OK", message: "Authentication successful" };
	} catch (error) {
		const err = error as { message?: string };
		return {
			status: "Error",
			message: err?.message || "Authentication failed",
		};
	}
}
