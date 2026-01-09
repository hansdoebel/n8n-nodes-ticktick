import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import type { Habit } from "@ticktick/types/api";
import { ENDPOINTS } from "@ticktick/constants/endpoints";
import { HABIT_STATUS } from "@ticktick/constants/defaults";

export const habitListFields: INodeProperties[] = [
	{
		displayName: "Include Archived",
		name: "includeArchived",
		type: "boolean",
		default: false,
		description: "Whether to include archived habits",
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["list"],
			},
		},
	},
];

export async function habitListExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const includeArchived = this.getNodeParameter(
		"includeArchived",
		index,
		false,
	) as boolean;

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.HABITS,
	) as Habit[];

	let habits = Array.isArray(response) ? response : [];

	if (!includeArchived) {
		habits = habits.filter((habit) => habit.status !== HABIT_STATUS.ARCHIVED);
	}

	return habits.map((habit) => ({ json: habit }));
}
