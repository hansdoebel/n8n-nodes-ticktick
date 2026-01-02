import { ICredentialType, INodeProperties } from "n8n-workflow";

export class TickTickSessionApi implements ICredentialType {
	name = "tickTickSessionApi";
	displayName = 'TickTick Session API (V2) API';
	documentationUrl = "https://github.com/hansdoebel/n8n-nodes-ticktick";
	properties: INodeProperties[] = [
		{
			displayName: "Username",
			name: "username",
			type: "string",
			default: "",
			required: true,
			description: "Your TickTick account email or username",
		},
		{
			displayName: "Password",
			name: "password",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			required: true,
			description: "Your TickTick account password",
		},
	];
	// Note: This credential uses session-based authentication
	// Authentication is handled manually in the session manager
	// since it requires cookie-based session tokens
}
