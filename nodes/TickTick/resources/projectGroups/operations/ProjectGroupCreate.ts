import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const projectGroupCreateFields: INodeProperties[] = [
	{
		displayName: "Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. Personal Projects",
		description: "The name of the project group (folder)",
		displayOptions: {
			show: {
				resource: ["projectGroup"],
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
				resource: ["projectGroup"],
				operation: ["create"],
			},
		},
		options: [
			{
				displayName: "Sort Order",
				name: "sortOrder",
				type: "number",
				default: 0,
				description: "The sort order of the project group",
			},
		],
	},
];

export async function projectGroupCreateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter("name", index) as string;
	const additionalFields = this.getNodeParameter("additionalFields", index) as {
		sortOrder?: number;
	};

	const body = {
		add: [
			{
				name,
				sortOrder: additionalFields.sortOrder || 0,
			},
		],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/batch/projectGroup",
		body,
	);

	return [{ json: response }];
}
