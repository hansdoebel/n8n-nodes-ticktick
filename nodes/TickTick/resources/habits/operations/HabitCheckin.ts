import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

function generateCheckinId(): string {
	return Array.from(
		{ length: 24 },
		() => Math.floor(Math.random() * 16).toString(16),
	).join("");
}

export const habitCheckinFields: INodeProperties[] = [
	{
		displayName: "Habit Name or ID",
		name: "habitId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getHabits",
		},
		required: true,
		default: "",
		description:
			'The habit to check in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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
	{
		displayName: "Goal",
		name: "goal",
		type: "number",
		default: 1,
		description: "The goal value at time of check-in",
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
	const goal = this.getNodeParameter("goal", index, 1) as number;

	const date = checkinDate ? new Date(checkinDate) : new Date();
	const checkinStamp = Number.parseInt(
		`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${
			String(date.getDate()).padStart(2, "0")
		}`,
		10,
	);

	const now = new Date();
	const timestamp = now.toISOString().replace(/\.\d{3}Z$/, ".000+0000");

	const checkin = {
		id: generateCheckinId(),
		habitId,
		checkinStamp,
		checkinTime: timestamp,
		opTime: timestamp,
		value,
		goal,
		status: 2,
	};

	const body = {
		add: [checkin],
		update: [],
		delete: [],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/habitCheckins/batch",
		body,
	);

	return [{ json: response }];
}
