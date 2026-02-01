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
			},
		},
		options: [
			{
				name: "Assign",
				value: "assign",
				action: "Assign a task to a user",
				description: "Assign a task to a user (V2 API only)",
			},
			{ name: "Complete", value: "complete", action: "Complete a task" },
			{ name: "Create", value: "create", action: "Create a task" },
			{ name: "Delete", value: "delete", action: "Delete a task" },
			{ name: "Get", value: "get", action: "Get a task" },
			{
				name: "List All",
				value: "listAll",
				action: "List all tasks",
				description: "List all tasks (V2 API only)",
			},
			{
				name: "List Completed",
				value: "listCompleted",
				action: "List completed tasks",
				description: "List completed tasks (V2 API only)",
			},
			{
				name: "List Deleted",
				value: "listDeleted",
				action: "List deleted tasks",
				description: "List deleted tasks (V2 API only)",
			},
			{
				name: "Move",
				value: "move",
				action: "Move a task",
				description: "Move a task to another project (V2 API only)",
			},
			{
				name: "Set Parent",
				value: "setParent",
				action: "Set parent task",
				description: "Set parent task (V2 API only)",
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
