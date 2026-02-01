import type { INodeProperties } from "n8n-workflow";
import {
	projectGroupCreateFields,
	projectGroupDeleteFields,
	projectGroupListFields,
	projectGroupUpdateFields,
} from "./operations";

export const projectGroupOperations: INodeProperties[] = [
	{
		displayName:
			"Project Groups require the TickTick Session API (V2) credential. Please select it above.",
		name: "projectGroupV2Notice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				resource: ["projectGroup"],
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
				resource: ["projectGroup"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a new project group (folder)",
				action: "Create a project group",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete a project group",
				action: "Delete a project group",
			},
			{
				name: "List",
				value: "list",
				description: "Get all project groups",
				action: "List all project groups",
			},
			{
				name: "Update",
				value: "update",
				description: "Update a project group",
				action: "Update a project group",
			},
		],
		default: "list",
	},
];

export const projectGroupFields: INodeProperties[] = [
	...projectGroupListFields,
	...projectGroupCreateFields,
	...projectGroupUpdateFields,
	...projectGroupDeleteFields,
];
