import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";

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
