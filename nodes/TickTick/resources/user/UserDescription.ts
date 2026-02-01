import type { INodeProperties } from "n8n-workflow";
import {
	userGetPreferencesFields,
	userGetProfileFields,
	userGetStatusFields,
} from "./operations";

export const userOperations: INodeProperties[] = [
	{
		displayName:
			"User requires the TickTick Session API (V2) credential. Please select it above.",
		name: "userV2Notice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				resource: ["user"],
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
				resource: ["user"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{
				name: "Get Preferences",
				value: "getPreferences",
				description: "Get user preferences and settings",
				action: "Get user preferences",
			},
			{
				name: "Get Profile",
				value: "getProfile",
				description: "Get the user profile",
				action: "Get user profile",
			},
			{
				name: "Get Status",
				value: "getStatus",
				description: "Get user subscription status",
				action: "Get user status",
			},
		],
		default: "getProfile",
	},
];

export const userFields: INodeProperties[] = [
	...userGetProfileFields,
	...userGetStatusFields,
	...userGetPreferencesFields,
];
