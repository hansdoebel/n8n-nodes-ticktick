import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const taskOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: { show: { resource: ["task"] } },
		options: [
			{ name: "Complete", value: "complete", action: "Complete a task" },
			{ name: "Create", value: "create", action: "Create a task" },
			{ name: "Delete", value: "delete", action: "Delete a task" },
			{ name: "Get", value: "get", action: "Get a task" },
			{
				name: "List All",
				value: "listAll",
				action: "List all tasks",
				description: "List all tasks across projects (V2 API)",
			},
			{
				name: "List Completed",
				value: "listCompleted",
				action: "List completed tasks",
				description: "Get completed tasks in a date range (V2 API)",
			},
			{
				name: "List Deleted",
				value: "listDeleted",
				action: "List deleted tasks",
				description: "Get deleted/trashed tasks (V2 API)",
			},
			{
				name: "Move",
				value: "move",
				action: "Move a task",
				description: "Move a task to a different project (V2 API)",
			},
			{
				name: "Set Parent",
				value: "setParent",
				action: "Set task parent",
				description: "Make a task a subtask of another task (V2 API)",
			},
			{ name: "Update", value: "update", action: "Update a task" },
		],
		default: "create",
	},
];

// Notice for V2-only task operations
export const taskV2Notice: INodeProperties = {
	displayName: "This operation requires V2 API authentication (Email/Password)",
	name: "taskV2Notice",
	type: "notice",
	default: "",
	displayOptions: {
		show: {
			resource: ["task"],
			operation: [
				"listAll",
				"listCompleted",
				"listDeleted",
				"move",
				"setParent",
			],
			authentication: ["tickTickTokenApi", "tickTickOAuth2Api"],
		},
	},
};

const taskFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const taskFields: INodeProperties[] = [
	taskV2Notice,
	...taskFieldArrays.flat(),
];
