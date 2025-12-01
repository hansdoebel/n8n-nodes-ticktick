import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from "n8n-workflow";

export class TickTickTokenApi implements ICredentialType {
	name = "tickTickTokenApi";
	displayName = "TickTick API Token";
	documentationUrl = "https://developer.ticktick.com/docs#/openapi";
	properties: INodeProperties[] = [
		{
			displayName: "API Token",
			name: "token",
			type: "string",
			default: "",
			typeOptions: {
				password: true,
			},
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: "generic",
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: "https://ticktick.com",
			url: "/open/v1/project",
		},
	};
}
