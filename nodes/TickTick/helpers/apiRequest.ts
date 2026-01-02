import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";
import {
	buildV2Headers,
	clearV2Session,
	getV2ApiBase,
	getV2Session,
} from "./sessionManager";

export async function tickTickApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	let authentication: string;

	// FIX: Robustly determine authentication method based on context
	try {
		// 1. Try LoadOptions context first (for dropdowns)
		if ("getCurrentNodeParameter" in this) {
			authentication = (this as ILoadOptionsFunctions).getCurrentNodeParameter(
				"authentication",
			) as string;
		} // 2. Try Execute/Hook context (for running the node)
		else if ("getNodeParameter" in this) {
			authentication = (this as IExecuteFunctions).getNodeParameter(
				"authentication",
				0,
			) as string;
		} // 3. Fallback
		else {
			authentication = "tickTickTokenApi";
		}
	} catch (error) {
		// If getting the parameter fails (e.g. during certain lifecycle events), default to Token
		authentication = "tickTickTokenApi";
	}

	// Use the official API domain.
	// If your previous code used ticktick.com and it worked, you can switch this back,
	// but api.ticktick.com is the documented standard.
	const baseUrl = "https://api.ticktick.com";

	const options: IHttpRequestOptions = {
		method,
		qs,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length) {
		options.body = body;
	}

	try {
		let response;

		if (authentication === "tickTickOAuth2Api") {
			// Type guard for helpers
			if (!this.helpers.requestOAuth2) {
				throw new Error("OAuth2 helper is not available");
			}
			response = await this.helpers.requestOAuth2.call(
				this,
				"tickTickOAuth2Api",
				options,
			);
		} else if (authentication === "tickTickTokenApi") {
			// Type guard for helpers
			if (!this.helpers.requestWithAuthentication) {
				throw new Error("Auth helper is not available");
			}
			response = await this.helpers.requestWithAuthentication.call(
				this,
				"tickTickTokenApi",
				options,
			);
		} else {
			throw new NodeApiError(this.getNode(), {
				message: `Unknown authentication method: ${authentication}`,
			});
		}

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

/**
 * Make a request to TickTick V2 API using session-based authentication
 */
export async function tickTickApiRequestV2(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	try {
		// Get session token and device ID
		const { token, deviceId } = await getV2Session.call(this, this);

		const options: IHttpRequestOptions = {
			method,
			url: `${getV2ApiBase()}${endpoint}`,
			headers: buildV2Headers(token, deviceId) as Record<string, string>,
			qs,
			json: true,
		};

		if (Object.keys(body).length) {
			options.body = body;
		}

		const response = await this.helpers.httpRequest(options);
		return response;
	} catch (error) {
		// If authentication failed, clear the cached session
		if (error.httpCode === 401 || error.httpCode === 403) {
			try {
				const credentials = await this.getCredentials("tickTickSessionApi");
				clearV2Session(credentials.username as string);
			} catch {
				// Ignore errors when clearing session
			}
		}
		throw new NodeApiError(this.getNode(), error);
	}
}

/**
 * Get the current authentication method from node parameters
 */
export function getAuthenticationType(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	itemIndex = 0,
): string {
	try {
		if ("getCurrentNodeParameter" in context) {
			return (context as ILoadOptionsFunctions).getCurrentNodeParameter(
				"authentication",
			) as string;
		} else if ("getNodeParameter" in context) {
			return (context as IExecuteFunctions).getNodeParameter(
				"authentication",
				itemIndex,
			) as string;
		}
	} catch {
		// Fallback to token auth
	}
	return "tickTickTokenApi";
}

/**
 * Check if the current authentication is V2 (session-based)
 */
export function isV2Auth(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	itemIndex = 0,
): boolean {
	return getAuthenticationType(context, itemIndex) === "tickTickSessionApi";
}
