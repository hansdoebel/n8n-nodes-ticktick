import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const focusGetDistributionFields: INodeProperties[] = [
	{
		displayName: "Start Date",
		name: "startDate",
		type: "dateTime",
		required: true,
		default: "",
		description: "The start date for the distribution data",
		displayOptions: {
			show: {
				resource: ["focus"],
				operation: ["getDistribution"],
			},
		},
	},
	{
		displayName: "End Date",
		name: "endDate",
		type: "dateTime",
		required: true,
		default: "",
		description: "The end date for the distribution data",
		displayOptions: {
			show: {
				resource: ["focus"],
				operation: ["getDistribution"],
			},
		},
	},
];

export async function focusGetDistributionExecute(
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

	const start = formatDate(startDate);
	const end = formatDate(endDate);

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		`/pomodoros/statistics/dist/${start}/${end}`,
	);

	return [{ json: response }];
}
