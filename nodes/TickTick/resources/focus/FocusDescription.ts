import type { INodeProperties } from "n8n-workflow";
import {
	focusGetDistributionFields,
	focusGetHeatmapFields,
} from "./operations";

export const focusOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["focus"],
			},
		},
		options: [
			{
				name: "Get Distribution",
				value: "getDistribution",
				description: "Get focus time distribution by tag",
				action: "Get focus distribution",
			},
			{
				name: "Get Heatmap",
				value: "getHeatmap",
				description: "Get focus/pomodoro heatmap data",
				action: "Get focus heatmap",
			},
		],
		default: "getHeatmap",
	},
];

export const focusFields: INodeProperties[] = [
	...focusGetHeatmapFields,
	...focusGetDistributionFields,
];
