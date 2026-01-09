import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectGroupUpdateFields: INodeProperties[] = [
	{
		displayName: 'Project Group Name or ID',
		name: "projectGroupId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getProjectGroups",
		},
		required: true,
		default: "",
		description: 'The project group to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["projectGroup"],
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
				resource: ["projectGroup"],
				operation: ["update"],
			},
		},
		options: [
			{
				displayName: "Name",
				name: "name",
				type: "string",
				default: "",
				description: "The new name for the project group",
			},
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

export async function projectGroupUpdateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const projectGroupId = this.getNodeParameter(
		"projectGroupId",
		index,
	) as string;
	const updateFields = this.getNodeParameter("updateFields", index) as {
		name?: string;
		sortOrder?: number;
	};

	const body = {
		update: [
			{
				id: projectGroupId,
				...updateFields,
			},
		],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.PROJECT_GROUPS_BATCH,
		body,
	);

	return [{ json: response }];
}
