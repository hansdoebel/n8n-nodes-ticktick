import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagRenameFields: INodeProperties[] = [
	{
		displayName: "Current Tag Name or ID",
		name: "oldName",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getTags",
		},
		required: true,
		default: "",
		description:
			'The current name of the tag. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["rename"],
			},
		},
	},
	{
		displayName: "New Name",
		name: "newName",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. Important",
		description: "The new name for the tag",
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["rename"],
			},
		},
	},
];

export async function tagRenameExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const oldName = this.getNodeParameter("oldName", index) as string;
	const newName = this.getNodeParameter("newName", index) as string;

	const body = {
		name: oldName,
		newName,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"PUT",
		"/tag/rename",
		body,
	);

	return [
		{
			json: {
				success: true,
				oldName,
				newName,
				...response,
			},
		},
	];
}
