import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const habitUnarchiveFields: INodeProperties[] = [
	{
		displayName: 'Habit Name or ID',
		name: "habitId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getHabits",
		},
		required: true,
		default: "",
		description: 'The habit to unarchive. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		`/habits/${habitId}/unarchive`,
	);

	return [{ json: response }];
}
