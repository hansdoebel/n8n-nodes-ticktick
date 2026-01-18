import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const taskOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["task"],
				authentication: ["tickTickTokenApi", "tickTickOAuth2Api"],
			},
		},
		options: [
			{ name: "Complete", value: "complete", action: "Complete a task" },
			{ name: "Create", value: "create", action: "Create a task" },
			{ name: "Delete", value: "delete", action: "Delete a task" },
			{ name: "Get", value: "get", action: "Get a task" },
			{ name: "Update", value: "update", action: "Update a task" },
		],
		default: "create",
	},
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["task"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{ name: "Assign", value: "assign", action: "Assign a task to a user" },
			{ name: "Complete", value: "complete", action: "Complete a task" },
			{ name: "Create", value: "create", action: "Create a task" },
			{ name: "Delete", value: "delete", action: "Delete a task" },
			{ name: "Get", value: "get", action: "Get a task" },
			{
				name: "List All",
				value: "listAll",
				action: "List all tasks",
			},
			{
				name: "List Completed",
				value: "listCompleted",
				action: "List completed tasks",
			},
			{
				name: "List Deleted",
				value: "listDeleted",
				action: "List deleted tasks",
			},
			{
				name: "Move",
				value: "move",
				action: "Move a task",
			},
			{ name: "Update", value: "update", action: "Update a task" },
		],
		default: "create",
	},
];

const taskFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const taskFields: INodeProperties[] = [...taskFieldArrays.flat()];
