import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const habitDeleteFields: INodeProperties[] = [
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
			'The habit to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["habit"],
				operation: ["delete"],
			},
		},
	},
];

export async function habitDeleteExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const habitId = this.getNodeParameter("habitId", index) as string;

	const body = {
		add: [],
		update: [],
		delete: [habitId],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/habits/batch",
		body,
	);

	return [{ json: response }];
}
