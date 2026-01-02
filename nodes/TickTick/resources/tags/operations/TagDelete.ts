import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagDeleteFields: INodeProperties[] = [
	{
		displayName: 'Tag Name or ID',
		name: "tagName",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getTags",
		},
		required: true,
		default: "",
		description: 'The tag to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["delete"],
			},
		},
	},
];

export async function tagDeleteExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tagName = this.getNodeParameter("tagName", index) as string;

	const body = {
		delete: [tagName],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/batch/tag",
		body,
	);

	return [
		{
			json: {
				success: true,
				deletedTag: tagName,
				...response,
			},
		},
	];
}
