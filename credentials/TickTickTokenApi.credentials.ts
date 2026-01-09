import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from "n8n-workflow";
import { ENDPOINTS } from "../nodes/TickTick/constants/endpoints";
import { TICKTICK_URLS } from "../nodes/TickTick/constants/urls";

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
			baseURL: TICKTICK_URLS.BASE_URL,
			url: ENDPOINTS.OPEN_V1_PROJECT,
		},
	};
}
