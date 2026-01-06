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

	try {
		if ("getCurrentNodeParameter" in this) {
			authentication = (this as ILoadOptionsFunctions).getCurrentNodeParameter(
				"authentication",
			) as string;
		} else if ("getNodeParameter" in this) {
			authentication = (this as IExecuteFunctions).getNodeParameter(
				"authentication",
				0,
			) as string;
		} else {
			authentication = "tickTickTokenApi";
		}
	} catch (error) {
		authentication = "tickTickTokenApi";
	}

	if (authentication === "tickTickSessionApi") {
		throw new NodeApiError(this.getNode(), {
			message:
				"V1 API endpoints are not compatible with V2 Session authentication. Please use the V2 API endpoints or switch to Token/OAuth2 authentication.",
			description: "The endpoint " +
				endpoint +
				" requires Token API or OAuth2 authentication.",
		});
	}

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
			if (!this.helpers.requestOAuth2) {
				throw new Error("OAuth2 helper is not available");
			}
			response = await this.helpers.requestOAuth2.call(
				this,
				"tickTickOAuth2Api",
				options,
			);
		} else if (authentication === "tickTickTokenApi") {
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

export async function tickTickApiRequestV2(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	try {
		const { token, deviceId, userAgent, deviceVersion } = await getV2Session(
			this,
		);

		const options: IHttpRequestOptions = {
			method,
			url: `${getV2ApiBase()}${endpoint}`,
			headers: buildV2Headers(
				token,
				deviceId,
				userAgent,
				deviceVersion,
			) as Record<string, string>,
			qs,
			json: true,
		};

		if (Object.keys(body).length) {
			options.body = body;
		}

		const response = await this.helpers.httpRequest(options);
		return response;
	} catch (error) {
		const statusCode = error.statusCode || error.response?.status ||
			error.httpCode;
		if (statusCode === 401 || statusCode === 403) {
			try {
				const credentials = await this.getCredentials("tickTickSessionApi");
				clearV2Session(credentials.username as string);
			} catch {
			}
		}
		throw new NodeApiError(this.getNode(), error);
	}
}

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
	}
	return "tickTickTokenApi";
}

export function isV2Auth(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	itemIndex = 0,
): boolean {
	return getAuthenticationType(context, itemIndex) === "tickTickSessionApi";
}
