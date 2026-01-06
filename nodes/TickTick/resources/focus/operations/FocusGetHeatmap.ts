import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

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

	const formatDate = (dateStr: string): string => {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}${month}${day}`;
	};

	const qs = {
		from: formatDate(startDate),
		to: formatDate(endDate),
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/pomodoros/statistics/heatmap",
		{},
		qs,
	);

	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}

	return [{ json: response }];
}
