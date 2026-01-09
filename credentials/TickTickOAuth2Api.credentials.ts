import { Icon, ICredentialType, INodeProperties } from "n8n-workflow";
import { TICKTICK_URLS } from "../nodes/TickTick/constants/urls";

export class TickTickOAuth2Api implements ICredentialType {
	name = "tickTickOAuth2Api";
	extends = ["oAuth2Api"];
	displayName = "TickTick OAuth2 API";
	documentationUrl = "https://developer.ticktick.com/docs#/openapi";

	icon: Icon = "file:../icons/ticktick.svg";

	properties: INodeProperties[] = [
		{
			displayName: "Grant Type",
			name: "grantType",
			type: "hidden",
			default: "pkce",
		},
		{
			displayName: "Authorization URL",
			name: "authUrl",
			type: "hidden",
			default: TICKTICK_URLS.OAUTH_AUTHORIZE,
			required: true,
		},
		{
			displayName: "Access Token URL",
			name: "accessTokenUrl",
			type: "hidden",
			default: TICKTICK_URLS.OAUTH_TOKEN,
			required: true,
		},
		{
			displayName: "Client ID",
			name: "clientId",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			required: true,
		},
		{
			displayName: "Scope",
			name: "scope",
			type: "hidden",
			default: ``,
		},
		{
			displayName: "Auth URI Query Parameters",
			name: "authQueryParameters",
			type: "hidden",
			default: "",
		},
		{
			displayName: "Authentication",
			name: "authentication",
			type: "hidden",
			default: "header",
		},
	];
}
