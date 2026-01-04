import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const taskListDeletedFields: INodeProperties[] = [
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: "Max number of results to return",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["listDeleted"],
			},
		},
	},
];

export async function taskListDeletedExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const limit = this.getNodeParameter("limit", index, 100) as number;

	const qs = {
		start: 0,
		limit,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/project/all/trash/pagination",
		{},
		qs,
	);

	if (Array.isArray(response)) {
		return response.map((task: IDataObject) => ({ json: task }));
	}

	if (response && response.tasks) {
		return (response.tasks as IDataObject[]).map((task) => ({
			json: task,
		}));
	}

	return [{ json: response }];
}
