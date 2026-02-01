import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { NodeOperationError } from "n8n-workflow";
import type { BatchResponse, Habit } from "@ticktick/types/api";
import { HABIT_STATUS } from "@ticktick/constants/defaults";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const habitArchiveFields: INodeProperties[] = [
	{
		displayName: "Habit",
		name: "habitId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The habit to archive",
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
				operation: ["archive"],
			},
		},
	},
];

export async function habitArchiveExecute(
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

	const habitsResponse = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.HABITS,
	) as Habit[];

	const habits = Array.isArray(habitsResponse) ? habitsResponse : [];
	const habit = habits.find((h) => h.id === habitId);

	if (!habit) {
		throw new NodeOperationError(
			this.getNode(),
			`Habit with ID ${habitId} not found`,
		);
	}

	const body = {
		add: [],
		update: [{ ...habit, status: HABIT_STATUS.ARCHIVED }],
		delete: [],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.HABITS_BATCH,
		body,
	) as BatchResponse;

	return [{ json: response }];
}
