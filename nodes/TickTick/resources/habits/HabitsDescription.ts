import type { INodeProperties } from "n8n-workflow";
import {
	habitArchiveFields,
	habitCheckinFields,
	habitCreateFields,
	habitDeleteFields,
	habitGetFields,
	habitListFields,
	habitUnarchiveFields,
	habitUpdateFields,
} from "./operations";

export const habitOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["habit"],
			},
		},
		options: [
			{
				name: "Archive",
				value: "archive",
				description: "Archive a habit",
				action: "Archive a habit",
			},
			{
				name: "Check In",
				value: "checkin",
				description: "Record a habit check-in",
				action: "Check in a habit",
			},
			{
				name: "Create",
				value: "create",
				description: "Create a new habit",
				action: "Create a habit",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete a habit",
				action: "Delete a habit",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a habit by ID",
				action: "Get a habit",
			},
			{
				name: "List",
				value: "list",
				description: "Get all habits",
				action: "List all habits",
			},
			{
				name: "Unarchive",
				value: "unarchive",
				description: "Unarchive a habit",
				action: "Unarchive a habit",
			},
			{
				name: "Update",
				value: "update",
				description: "Update a habit",
				action: "Update a habit",
			},
		],
		default: "list",
	},
];

export const habitFields: INodeProperties[] = [
	...habitListFields,
	...habitGetFields,
	...habitCreateFields,
	...habitUpdateFields,
	...habitDeleteFields,
	...habitCheckinFields,
	...habitArchiveFields,
	...habitUnarchiveFields,
];
