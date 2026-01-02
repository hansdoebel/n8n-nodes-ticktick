import type { INodeProperties } from "n8n-workflow";
import { syncAllFields } from "./operations";

export const syncOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["sync"],
			},
		},
		options: [
			{
				name: "Sync All",
				value: "syncAll",
				description:
					"Get all user data including projects, tasks, tags, habits, and more",
				action: "Sync all data",
			},
		],
		default: "syncAll",
	},
];

export const syncFields: INodeProperties[] = [...syncAllFields];
