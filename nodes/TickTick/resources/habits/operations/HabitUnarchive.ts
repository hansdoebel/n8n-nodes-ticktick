import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { NodeOperationError } from "n8n-workflow";

export const habitUnarchiveFields: INodeProperties[] = [
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
			'The habit to unarchive. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["unarchive"],
			},
		},
	},
];

export async function habitUnarchiveExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const habitId = this.getNodeParameter("habitId", index) as string;

	const habitsResponse = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/habits",
	);
	const habits = Array.isArray(habitsResponse) ? habitsResponse : [];
	const habit = habits.find((h: any) => h.id === habitId);

	if (!habit) {
		throw new NodeOperationError(
			this.getNode(),
			`Habit with ID ${habitId} not found`,
		);
	}

	const body = {
		add: [],
		update: [{ ...habit, status: 0 }],
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
