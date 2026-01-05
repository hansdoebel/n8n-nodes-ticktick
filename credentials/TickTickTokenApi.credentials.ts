import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from "n8n-workflow";

export class TickTickTokenApi implements ICredentialType {
	name = "tickTickTokenApi";
	displayName = "TickTick API";
	documentationUrl = "https://developer.ticktick.com/docs#/openapi";
	icon: Icon = "file:../icons/ticktick.svg";
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
