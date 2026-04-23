import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { DateTime } from "luxon";
import { ENDPOINTS } from "../../../helpers/constants";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";

export const taskListCompletedFields: INodeProperties[] = [
	{
		displayName: "Start Date",
		name: "startDate",
		type: "dateTime",
		required: true,
		default: "",
		description: "The start date for completed tasks",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["listCompleted"],
			},
		},
	},
	{
		displayName: "End Date",
		name: "endDate",
		type: "dateTime",
		required: true,
		default: "",
		description: "The end date for completed tasks",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["listCompleted"],
			},
		},
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: "Max number of results to return",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["listCompleted"],
			},
		},
	},
];

export async function taskListCompletedExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const startDate = this.getNodeParameter("startDate", index) as string;
	const endDate = this.getNodeParameter("endDate", index) as string;
	const limit = this.getNodeParameter("limit", index, 100) as number;

	const formatDateTime = (dateStr: string): string =>
		DateTime.fromISO(dateStr).toUTC().toFormat("yyyy-MM-dd HH:mm:ss");

	const qs = {
		from: formatDateTime(startDate),
		to: formatDateTime(endDate),
		limit,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.PROJECT_ALL_COMPLETED,
		{},
		qs,
	);

	if (Array.isArray(response)) {
		return response.map((task: IDataObject) => ({ json: task }));
	}

	return [{ json: response }];
}
