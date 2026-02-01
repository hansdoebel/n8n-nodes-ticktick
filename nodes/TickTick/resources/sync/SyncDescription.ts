import type { INodeProperties } from "n8n-workflow";
import { syncAllFields } from "./operations";

export const syncOperations: INodeProperties[] = [
	{
		displayName:
			"Sync requires the TickTick Session API (V2) credential. Please select it above.",
		name: "syncV2Notice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				resource: ["sync"],
				authentication: ["tickTickTokenApi", "tickTickOAuth2Api"],
			},
		},
	},
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["sync"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{
				name: "Sync All",
				value: "syncAll",
				description: "Get all user data including projects, tasks, and more",
				action: "Sync all data",
			},
		],
		default: "syncAll",
	},
];

export const syncFields: INodeProperties[] = [...syncAllFields];
