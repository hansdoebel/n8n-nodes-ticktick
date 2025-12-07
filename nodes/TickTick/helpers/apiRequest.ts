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
	const authentication = this.getNodeParameter("authentication", 0) as string;
	const baseUrl = "https://ticktick.com";

	const options: IHttpRequestOptions = {
		method,
		qs,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length) options.body = body;

	try {
		if (authentication === "tickTickOAuth2Api") {
			return await this.helpers.requestOAuth2!.call(
				this,
				"tickTickOAuth2Api",
				options,
			);
		}
		if (authentication === "tickTickTokenApi") {
			return await this.helpers.requestWithAuthentication!.call(
				this,
				"tickTickTokenApi",
				options,
			);
		}

		throw new NodeApiError(this.getNode(), {
			message: `Unknown authentication method: ${authentication}`,
		});
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
