import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagUpdateFields: INodeProperties[] = [
	{
		displayName: "Tag",
		name: "tagName",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The tag to update",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchTags",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By Name",
				name: "name",
				type: "string",
				placeholder: "e.g. Important",
			},
		],
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
	const tagNameValue = this.getNodeParameter("tagName", index) as
		| string
		| { mode: string; value: string };
	const updateFields = this.getNodeParameter("updateFields", index) as {
		label?: string;
		color?: string;
		sortType?: string;
		parent?: string;
		sortOrder?: number;
	};

	let tagName: string;

	if (typeof tagNameValue === "object" && tagNameValue !== null) {
		tagName = tagNameValue.value || "";
	} else {
		tagName = tagNameValue || "";
	}

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
