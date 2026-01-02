import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagUpdateFields: INodeProperties[] = [
	{
		displayName: 'Tag Name or ID',
		name: "tagName",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getTags",
		},
		required: true,
		default: "",
		description: 'The tag to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["update"],
			},
		},
	},
	{
		displayName: "Update Fields",
		name: "updateFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["update"],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: "#F18181",
				description: "The color of the tag in hex format",
			},
			{
				displayName: "Parent Tag",
				name: "parent",
				type: "string",
				default: "",
				description: "The name of the parent tag for nested tags",
			},
			{
				displayName: "Sort Order",
				name: "sortOrder",
				type: "number",
				default: 0,
				description: "The sort order of the tag",
			},
		],
	},
];

export async function tagUpdateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tagName = this.getNodeParameter("tagName", index) as string;
	const updateFields = this.getNodeParameter("updateFields", index) as {
		color?: string;
		parent?: string;
		sortOrder?: number;
	};

	const body = {
		update: [
			{
				name: tagName,
				...updateFields,
			},
		],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/batch/tag",
		body,
	);

	return [{ json: response }];
}
