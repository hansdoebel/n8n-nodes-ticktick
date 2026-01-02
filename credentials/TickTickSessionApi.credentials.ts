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
			displayName: "Note",
			name: "notice",
			type: "notice",
			default: "",
			displayOptions: {
				show: {},
			},
			description:
				"Credential testing is disabled due to n8n limitations. Your credentials will be validated when you use them in a workflow. Make sure to use your TickTick account email as username.",
		},
	];

	// No test - authentication happens at runtime
	// This avoids n8n credential test expression bugs and JSON body issues
	// See: https://github.com/n8n-io/n8n/issues/15996
}
