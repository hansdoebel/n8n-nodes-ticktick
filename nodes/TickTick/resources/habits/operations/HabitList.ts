import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

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

	const response = await tickTickApiRequestV2.call(this, "GET", "/habits");

	let habits = Array.isArray(response) ? response : [];

	if (!includeArchived) {
		habits = habits.filter((habit: { status?: number }) => habit.status !== 2);
	}

	return habits.map((habit: IDataObject) => ({ json: habit }));
}
