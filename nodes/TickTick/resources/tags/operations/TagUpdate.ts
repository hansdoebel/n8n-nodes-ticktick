import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagUpdateFields: INodeProperties[] = [
	{
		displayName: "Tag Name or ID",
		name: "tagName",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getTags",
		},
		required: true,
		default: "",
		description:
			'The tag to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
				displayName: "Label",
				name: "label",
				type: "string",
				default: "",
				description: "The display name of the tag",
			},
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: "#F18181",
				description: "The color of the tag in hex format",
			},
			{
				displayName: "Sort Type",
				name: "sortType",
				type: "options",
				options: [
					{ name: "None", value: "NONE" },
					{ name: "Manual", value: "MANUAL" },
					{ name: "Alphabetical", value: "ALPHABETICAL" },
				],
				default: "NONE",
				description: "How the tag is sorted within its group",
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
		label?: string;
		color?: string;
		sortType?: string;
		parent?: string;
		sortOrder?: number;
	};

	if (!updateFields.label) {
		throw new Error("Tag label is required for update.");
	}

	const tag: Record<string, unknown> = {
		name: tagName,
		label: updateFields.label,
		rawName: tagName,
	};

	if (updateFields.color) {
		tag.color = updateFields.color;
	}
	if (updateFields.parent) {
		tag.parent = updateFields.parent;
	}
	if (updateFields.sortType && updateFields.sortType !== "NONE") {
		tag.sortType = updateFields.sortType;
	}
	if (typeof updateFields.sortOrder === "number") {
		tag.sortOrder = updateFields.sortOrder;
	}

	const body = {
		update: [tag],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/batch/tag",
		body,
	);

	return [{ json: response }];
}
