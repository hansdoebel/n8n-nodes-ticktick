import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagMergeFields: INodeProperties[] = [
	{
		displayName: 'Source Tag Name or ID',
		name: "sourceTag",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getTags",
		},
		required: true,
		default: "",
		description: 'The tag to merge from (will be deleted). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["merge"],
			},
		},
	},
	{
		displayName: 'Target Tag Name or ID',
		name: "targetTag",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getTags",
		},
		required: true,
		default: "",
		description: 'The tag to merge into (will be kept). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["merge"],
			},
		},
	},
];

export async function tagMergeExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sourceTag = this.getNodeParameter("sourceTag", index) as string;
	const targetTag = this.getNodeParameter("targetTag", index) as string;

	const body = {
		sourceName: sourceTag,
		targetName: targetTag,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/tag/merge",
		body,
	);

	return [
		{
			json: {
				success: true,
				sourceTag,
				targetTag,
				...response,
			},
		},
	];
}
