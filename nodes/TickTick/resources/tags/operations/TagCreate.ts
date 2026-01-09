import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

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
	};

	const normalizedName = name.toLowerCase().replace(/\s+/g, "");

	const tag: Record<string, unknown> = {
		name: normalizedName,
		label: name,
	};

	if (additionalFields.color) {
		tag.color = additionalFields.color;
	}
	if (additionalFields.parent) {
		tag.parent = additionalFields.parent;
	}

	const body = {
		add: [tag],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.TAGS_BATCH,
		body,
	);

	return [{ json: response }];
}
