import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { DateTime } from "luxon";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { formatDateYYYYMMDD } from "../../../helpers/dates";
import type { FocusDistribution } from "../../../helpers/types";
import { ENDPOINTS } from "../../../helpers/constants";

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

	if (!startDate) {
		throw new Error("Start date is required");
	}

	if (!endDate) {
		throw new Error("End date is required");
	}

	const startDt = DateTime.fromISO(startDate, { setZone: true });
	const endDt = DateTime.fromISO(endDate, { setZone: true });

	if (startDt > endDt) {
		throw new Error("Start date must be before or equal to end date");
	}

	const start = formatDateYYYYMMDD(startDate);
	const end = formatDateYYYYMMDD(endDate);

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.FOCUS_DISTRIBUTION(start, end),
	) as FocusDistribution;

	return [{ json: response }];
}
