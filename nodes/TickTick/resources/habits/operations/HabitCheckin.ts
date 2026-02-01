import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { generateCheckinId } from "@helpers/generators";
import {
	formatDateStampYYYYMMDD,
	formatISO8601WithMillis,
} from "@helpers/dates";
import type { BatchResponse } from "@ticktick/types/api";
import { CHECKIN_STATUS } from "@ticktick/constants/defaults";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const habitCheckinFields: INodeProperties[] = [
	{
		displayName: "Habit",
		name: "habitId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The habit to check in",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchHabits",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 60f1a2b3c4d5e6f7a8b9c0d1",
			},
		],
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
	const habitIdValue = this.getNodeParameter("habitId", index) as
		| string
		| { mode: string; value: string };

	let habitId: string;
	if (typeof habitIdValue === "object" && habitIdValue !== null) {
		habitId = habitIdValue.value || "";
	} else {
		habitId = habitIdValue || "";
	}

	if (!habitId || habitId.trim() === "") {
		throw new Error("Habit ID is required");
	}

	const value = this.getNodeParameter("value", index, 1) as number;
	const checkinDate = this.getNodeParameter("checkinDate", index, "") as string;
	const goal = this.getNodeParameter("goal", index, 1) as number;

	const date = checkinDate ? new Date(checkinDate) : new Date();
	const checkinStamp = formatDateStampYYYYMMDD(date);
	const timestamp = formatISO8601WithMillis(new Date());

	const checkin = {
		id: generateCheckinId(),
		habitId,
		checkinStamp,
		checkinTime: timestamp,
		opTime: timestamp,
		value,
		goal,
		status: CHECKIN_STATUS.COMPLETED,
	};

	const body = {
		add: [checkin],
		update: [],
		delete: [],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.HABIT_CHECKINS_BATCH,
		body,
	) as BatchResponse;

	return [{ json: response }];
}
