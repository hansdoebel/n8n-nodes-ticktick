import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { NodeOperationError } from "n8n-workflow";
import type { Habit } from "@ticktick/types/api";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const habitGetFields: INodeProperties[] = [
	{
		displayName: "Habit",
		name: "habitId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The habit to retrieve",
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
				operation: ["get"],
			},
		},
	},
];

export async function habitGetExecute(
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

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.HABITS,
	) as Habit[];

	const habits = Array.isArray(response) ? response : [];
	const habit = habits.find((h) => h.id === habitId);

	if (!habit) {
		throw new NodeOperationError(
			this.getNode(),
			`Habit with ID ${habitId} not found`,
		);
	}

	return [{ json: habit }];
}
