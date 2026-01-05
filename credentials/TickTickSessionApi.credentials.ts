import type { Icon, ICredentialType, INodeProperties } from "n8n-workflow";

export class TickTickSessionApi implements ICredentialType {
	name = "tickTickSessionApi";
	displayName = "TickTick (V2) Session API";
	documentationUrl = "https://github.com/hansdoebel/n8n-nodes-ticktick";
	icon: Icon = "file:../icons/ticktick.svg";
	properties: INodeProperties[] = [
		{
			displayName: "Email",
			name: "username",
			type: "string",
			default: "",
			required: true,
			description: "Your TickTick account email",
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
			displayName:
				"Session auth uses TickTick's unofficial V2 API. Credential testing is disabled; validation happens when used in a workflow. 2FA is not supported.",
			name: "notice",
			type: "notice",
			default: "",
		},
	];
}
