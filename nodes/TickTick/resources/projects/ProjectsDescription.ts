import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const projectOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: { show: { resource: ["project"] } },
		options: [
			{ name: "Create", value: "create", action: "Create a project" },
			{ name: "Get", value: "get", action: "Get a project" },
			{ name: "Update", value: "update", action: "Update a project" },
			{ name: "Delete", value: "delete", action: "Delete a project" },
		],
		default: "create",
	},
];

const projectFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const projectFields: INodeProperties[] = [...projectFieldArrays.flat()];
