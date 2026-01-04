import type { ICredentialType, INodeProperties } from "n8n-workflow";

export class TickTickSessionApi implements ICredentialType {
	name = "tickTickSessionApi";
	displayName = "TickTick Session API (V2)";
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
		{
			displayName: "User Agent",
			name: "userAgent",
			type: "string",
			default: "Mozilla/5.0 (rv:145.0) Firefox/145.0",
			description: "Advanced: User-Agent header for the V2 API.",
		},
		{
			displayName: "Device Version",
			name: "deviceVersion",
			type: "number",
			default: 6430,
			description: "Advanced: device version used in the X-Device header.",
		},
		{
			displayName: "Device ID",
			name: "deviceId",
			type: "string",
			default: "",
			description:
				"Advanced: fixed device ID (24 hex chars). Leave blank to auto-generate.",
		},
		{
			displayName:
				"Session auth uses TickTick's unofficial V2 API. Credential testing is disabled; validation happens when used in a workflow. 2FA is not supported. Use your TickTick account email as username.",
			name: "notice",
			type: "notice",
			default: "",
		},
	];
}
