import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { generateHabitId } from "@helpers/generators";
import type { BatchResponse } from "@ticktick/types/api";
import {
	DEFAULT_HABIT_COLOR,
	DEFAULT_HABIT_ENCOURAGEMENT,
	DEFAULT_HABIT_GOAL,
	DEFAULT_HABIT_ICON,
	DEFAULT_HABIT_REPEAT_RULE,
	DEFAULT_HABIT_STEP,
	DEFAULT_HABIT_TARGET_DAYS,
	DEFAULT_HABIT_TYPE,
	DEFAULT_HABIT_UNIT,
} from "@ticktick/constants/defaults";

export const habitCreateFields: INodeProperties[] = [
	{
		displayName: "Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. Morning Exercise",
		description: "The name of the habit",
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["create"],
			},
		},
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["create"],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: DEFAULT_HABIT_COLOR,
				description: "The color of the habit in hex format",
			},
			{
				displayName: "Encouragement",
				name: "encouragement",
				type: "string",
				default: "",
				placeholder: "e.g. Keep up the great work!",
				description: "A motivational message for the habit",
			},
			{
				displayName: "Goal",
				name: "goal",
				type: "number",
				default: DEFAULT_HABIT_GOAL,
				description: "The target goal value for the habit",
			},
			{
				displayName: "Icon",
				name: "icon",
				type: "string",
				default: DEFAULT_HABIT_ICON,
				description: "The icon name for the habit",
			},
			{
				displayName: "Reminders",
				name: "reminders",
				type: "string",
				default: "",
				placeholder: "e.g. 09:00,21:00",
				description:
					'Reminder times in HH:MM format, comma-separated (e.g., "09:00,21:00")',
			},
			{
				displayName: "Repeat Rule",
				name: "repeatRule",
				type: "string",
				default: DEFAULT_HABIT_REPEAT_RULE,
				description: "The RRULE for habit recurrence",
			},
			{
				displayName: "Step",
				name: "step",
				type: "number",
				default: DEFAULT_HABIT_STEP,
				description: "The increment step for numeric habits",
			},
			{
				displayName: "Target Days",
				name: "targetDays",
				type: "number",
				default: DEFAULT_HABIT_TARGET_DAYS,
				description: "The target number of days for the habit",
			},
			{
				displayName: "Type",
				name: "type",
				type: "options",
				options: [
					{ name: "Boolean (Yes/No)", value: "Boolean" },
					{ name: "Numeric (Count)", value: "Real" },
				],
				default: DEFAULT_HABIT_TYPE,
				description: "The type of habit tracking",
			},
			{
				displayName: "Unit",
				name: "unit",
				type: "string",
				default: DEFAULT_HABIT_UNIT,
				placeholder: "e.g. glasses, minutes, pages",
				description: "The unit of measurement for numeric habits",
			},
		],
	},
];

export async function habitCreateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter("name", index) as string;
	const additionalFields = this.getNodeParameter("additionalFields", index) as {
		color?: string;
		encouragement?: string;
		goal?: number;
		icon?: string;
		reminders?: string;
		repeatRule?: string;
		step?: number;
		targetDays?: number;
		type?: string;
		unit?: string;
	};

	const habit = {
		id: generateHabitId(),
		name,
		type: additionalFields.type || DEFAULT_HABIT_TYPE,
		color: additionalFields.color || DEFAULT_HABIT_COLOR,
		icon: additionalFields.icon || DEFAULT_HABIT_ICON,
		goal: additionalFields.goal || DEFAULT_HABIT_GOAL,
		step: additionalFields.step || DEFAULT_HABIT_STEP,
		unit: additionalFields.unit || DEFAULT_HABIT_UNIT,
		repeatRule: additionalFields.repeatRule || DEFAULT_HABIT_REPEAT_RULE,
		targetDays: additionalFields.targetDays || DEFAULT_HABIT_TARGET_DAYS,
		encouragement: additionalFields.encouragement ||
			DEFAULT_HABIT_ENCOURAGEMENT,
		recordEnable: false,
		sortOrder: 0,
		...(additionalFields.reminders && {
			reminders: additionalFields.reminders.split(",").map((r) => r.trim()),
		}),
	};

	const body = {
		add: [habit],
		update: [],
		delete: [],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/habits/batch",
		body,
	) as BatchResponse;

	return [{ json: response }];
}
