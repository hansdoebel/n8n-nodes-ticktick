import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { NodeOperationError } from "n8n-workflow";
import type { BatchResponse, Habit } from "@ticktick/types/api";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const habitUpdateFields: INodeProperties[] = [
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
			'The habit to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["update"],
			},
		},
	},
	{
		displayName: "Update Fields",
		name: "updateFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["update"],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: "#97E38B",
				description: "The color of the habit in hex format",
			},
			{
				displayName: "Encouragement",
				name: "encouragement",
				type: "string",
				default: "",
				description: "A motivational message for the habit",
			},
			{
				displayName: "Goal",
				name: "goal",
				type: "number",
				default: 1,
				description: "The target goal value for the habit",
			},
			{
				displayName: "Icon",
				name: "icon",
				type: "string",
				default: "",
				description: "The icon name for the habit",
			},
			{
				displayName: "Name",
				name: "name",
				type: "string",
				default: "",
				description: "The new name for the habit",
			},
			{
				displayName: "Reminders",
				name: "reminders",
				type: "string",
				default: "",
				description:
					'Reminder times in HH:MM format, comma-separated (e.g., "09:00,21:00")',
			},
			{
				displayName: "Repeat Rule",
				name: "repeatRule",
				type: "string",
				default: "",
				description: "The RRULE for habit recurrence",
			},
			{
				displayName: "Step",
				name: "step",
				type: "number",
				default: 0,
				description: "The increment step for numeric habits",
			},
			{
				displayName: "Target Days",
				name: "targetDays",
				type: "number",
				default: 0,
				description: "The target number of days for the habit",
			},
			{
				displayName: "Unit",
				name: "unit",
				type: "string",
				default: "",
				description: "The unit of measurement for numeric habits",
			},
		],
	},
];

export async function habitUpdateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const habitId = this.getNodeParameter("habitId", index) as string;

	if (!habitId || habitId.trim() === "") {
		throw new Error("Habit ID is required");
	}

	const updateFields = this.getNodeParameter("updateFields", index) as {
		color?: string;
		encouragement?: string;
		goal?: number;
		icon?: string;
		name?: string;
		reminders?: string;
		repeatRule?: string;
		step?: number;
		targetDays?: number;
		unit?: string;
	};

	const habitsResponse = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.HABITS,
	) as Habit[];

	const habits = Array.isArray(habitsResponse) ? habitsResponse : [];
	const currentHabit = habits.find((h) => h.id === habitId);

	if (!currentHabit) {
		throw new NodeOperationError(
			this.getNode(),
			`Habit with ID ${habitId} not found`,
		);
	}

	const body: Habit = {
		...currentHabit,
		id: habitId,
	};

	if (updateFields.name !== undefined) body.name = updateFields.name;
	if (updateFields.color !== undefined) body.color = updateFields.color;
	if (updateFields.icon !== undefined) body.iconRes = updateFields.icon;
	if (updateFields.goal !== undefined) body.goal = updateFields.goal;
	if (updateFields.step !== undefined) body.step = updateFields.step;
	if (updateFields.unit !== undefined) body.unit = updateFields.unit;
	if (updateFields.repeatRule !== undefined) {
		body.repeatRule = updateFields.repeatRule;
	}
	if (updateFields.targetDays !== undefined) {
		body.targetDays = updateFields.targetDays;
	}
	if (updateFields.encouragement !== undefined) {
		body.encouragement = updateFields.encouragement;
	}

	if (updateFields.reminders !== undefined) {
		body.reminders = updateFields.reminders.split(",").map((r) => r.trim());
	}

	const batchBody = {
		add: [],
		update: [body],
		delete: [],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.HABITS_BATCH,
		batchBody,
	) as BatchResponse;

	return [{ json: response }];
}
