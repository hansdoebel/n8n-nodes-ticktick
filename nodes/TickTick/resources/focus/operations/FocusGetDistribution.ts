import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { formatDateYYYYMMDD } from "@helpers/dates";
import type { FocusDistribution } from "@ticktick/types/api";

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

	const start = formatDateYYYYMMDD(startDate);
	const end = formatDateYYYYMMDD(endDate);

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		`/pomodoros/statistics/dist/${start}/${end}`,
	) as FocusDistribution;

	return [{ json: response }];
}
