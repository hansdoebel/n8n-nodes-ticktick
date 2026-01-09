import type { INodeProperties } from "n8n-workflow";
import {
	tagCreateFields,
	tagDeleteFields,
	tagListFields,
	tagMergeFields,
	tagRenameFields,
	tagUpdateFields,
} from "./operations";

export const tagOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["tag"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a new tag",
				action: "Create a tag",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete a tag",
				action: "Delete a tag",
			},
			{
				name: "List",
				value: "list",
				description: "Get all tags",
				action: "List all tags",
			},
			{
				name: "Merge",
				value: "merge",
				description: "Merge one tag into another",
				action: "Merge tags",
			},
			{
				name: "Rename",
				value: "rename",
				description: "Rename a tag",
				action: "Rename a tag",
			},
			{
				name: "Update",
				value: "update",
				description: "Update a tag",
				action: "Update a tag",
			},
		],
		default: "list",
	},
];

export const tagFields: INodeProperties[] = [
	...tagListFields,
	...tagCreateFields,
	...tagUpdateFields,
	...tagDeleteFields,
	...tagRenameFields,
	...tagMergeFields,
];
