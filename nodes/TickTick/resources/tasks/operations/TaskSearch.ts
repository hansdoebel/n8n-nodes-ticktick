import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";

export const taskSearchFields: INodeProperties[] = [
	{
		displayName: "Keywords",
		name: "keywords",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. groceries",
		description:
			"Keywords to search for. Matches against task title and content across all projects, including completed and trashed tasks.",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["search"],
			},
		},
	},
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
				operation: ["search"],
			},
		},
	},
];

export async function taskSearchExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const keywords = this.getNodeParameter("keywords", index, "") as string;
	const limit = this.getNodeParameter("limit", index, 0) as number;

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.SEARCH_ALL,
		{},
		{ keywords },
	);

	let tasks: IDataObject[] = [];
	if (Array.isArray(response)) {
		tasks = response as IDataObject[];
	} else if (response && Array.isArray((response as IDataObject).tasks)) {
		tasks = (response as IDataObject).tasks as IDataObject[];
	} else {
		return [{ json: response as IDataObject }];
	}

	const limited = limit > 0 ? tasks.slice(0, limit) : tasks;
	return limited.map((task) => ({ json: task }));
}
