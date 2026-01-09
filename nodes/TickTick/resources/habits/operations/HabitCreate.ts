import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

function generateHabitId(): string {
	return Array.from(
		{ length: 24 },
		() => Math.floor(Math.random() * 16).toString(16),
	).join("");
}

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
				default: "#97E38B",
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
				default: 1,
				description: "The target goal value for the habit",
			},
			{
				displayName: "Icon",
				name: "icon",
				type: "string",
				default: "habit_daily_check_in",
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
				default: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
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
				displayName: "Type",
				name: "type",
				type: "options",
				options: [
					{ name: "Boolean (Yes/No)", value: "Boolean" },
					{ name: "Numeric (Count)", value: "Real" },
				],
				default: "Boolean",
				description: "The type of habit tracking",
			},
			{
				displayName: "Unit",
				name: "unit",
				type: "string",
				default: "Count",
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

	const habit: IDataObject = {
		id: generateHabitId(),
		name,
		type: additionalFields.type || "Boolean",
		color: additionalFields.color || "#97E38B",
		icon: additionalFields.icon || "habit_daily_check_in",
		goal: additionalFields.goal || 1,
		step: additionalFields.step || 0,
		unit: additionalFields.unit || "Count",
		repeatRule: additionalFields.repeatRule ||
			"RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
		targetDays: additionalFields.targetDays || 0,
		encouragement: additionalFields.encouragement || "",
		recordEnable: false,
		sortOrder: 0,
	};

	if (additionalFields.reminders) {
		habit.reminders = additionalFields.reminders.split(",").map((r) =>
			r.trim()
		);
	}

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
	);

	return [{ json: response }];
}
