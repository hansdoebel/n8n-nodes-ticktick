import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagCreateFields: INodeProperties[] = [
	{
		displayName: "Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. Work",
		description: "The name of the tag",
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["create"],
			},
		},
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["create"],
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
				placeholder: "e.g. Projects",
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

export async function tagCreateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter("name", index) as string;
	const additionalFields = this.getNodeParameter("additionalFields", index) as {
		color?: string;
		parent?: string;
		sortOrder?: number;
	};

	const body = {
		add: [
			{
				name: name.toLowerCase(),
				label: name,
				color: additionalFields.color,
				parent: additionalFields.parent,
				sortOrder: additionalFields.sortOrder,
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
