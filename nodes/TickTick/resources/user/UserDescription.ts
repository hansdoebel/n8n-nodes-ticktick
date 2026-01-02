import type { INodeProperties } from "n8n-workflow";
import {
	userGetPreferencesFields,
	userGetProfileFields,
	userGetStatusFields,
} from "./operations";

export const userOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["user"],
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
