import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { formatDateYYYYMMDD } from "@helpers/dates";
import type { FocusHeatmap } from "@ticktick/types/api";

export const focusGetHeatmapFields: INodeProperties[] = [
	{
		displayName: "Start Date",
		name: "startDate",
		type: "dateTime",
		required: true,
		default: "",
		description: "The start date for the heatmap data",
		displayOptions: {
			show: {
				resource: ["focus"],
				operation: ["getHeatmap"],
			},
		},
	},
	{
		displayName: "End Date",
		name: "endDate",
		type: "dateTime",
		required: true,
		default: "",
		description: "The end date for the heatmap data",
		displayOptions: {
			show: {
				resource: ["focus"],
				operation: ["getHeatmap"],
			},
		},
	},
];

export async function focusGetHeatmapExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const startDate = this.getNodeParameter("startDate", index) as string;
	const endDate = this.getNodeParameter("endDate", index) as string;

	const start = formatDateYYYYMMDD(startDate);
	const end = formatDateYYYYMMDD(endDate);

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		`/pomodoros/statistics/heatmap/${start}/${end}`,
	) as FocusHeatmap[];

	if (Array.isArray(response)) {
		return response.map((item) => ({ json: item }));
	}

	return [{ json: response }];
}
