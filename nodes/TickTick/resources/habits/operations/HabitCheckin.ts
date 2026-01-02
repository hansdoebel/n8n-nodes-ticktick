import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const habitCheckinFields: INodeProperties[] = [
	{
		displayName: 'Habit Name or ID',
		name: "habitId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getHabits",
		},
		required: true,
		default: "",
		description: 'The habit to check in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["checkin"],
			},
		},
	},
	{
		displayName: "Value",
		name: "value",
		type: "number",
		default: 1,
		description:
			"The check-in value (1 for boolean habits, or the amount for numeric habits)",
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["checkin"],
			},
		},
	},
	{
		displayName: "Check-in Date",
		name: "checkinDate",
		type: "dateTime",
		default: "",
		description: "The date of the check-in (defaults to today)",
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["checkin"],
			},
		},
	},
];

export async function habitCheckinExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const habitId = this.getNodeParameter("habitId", index) as string;
	const value = this.getNodeParameter("value", index, 1) as number;
	const checkinDate = this.getNodeParameter("checkinDate", index, "") as string;

	// Format date for checkin - use current date if not provided
	const date = checkinDate ? new Date(checkinDate) : new Date();
	const checkinStamp = date.toISOString();

	const body = {
		habitId,
		value,
		checkinStamp,
		checkinTime: checkinStamp,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/habitCheckins",
		body,
	);

	return [{ json: response }];
}
