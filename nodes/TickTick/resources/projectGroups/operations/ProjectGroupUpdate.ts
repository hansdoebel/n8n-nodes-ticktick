import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { extractResourceLocatorValue } from "@ticktick/helpers";
import { ENDPOINTS } from "@ticktick/constants/endpoints";
import type { ResourceLocatorValue } from "@ticktick/types/api";

export const projectGroupUpdateFields: INodeProperties[] = [
	{
		displayName: "Project Group",
		name: "projectGroupId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The project group to update",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjectGroupsForCreate",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				validation: [
					{
						type: "regex",
						properties: {
							regex: "^[a-zA-Z0-9]+$",
							errorMessage:
								"Project Group ID must contain only letters and numbers",
						},
					},
				],
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
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
	const projectGroupIdValue = this.getNodeParameter(
		"projectGroupId",
		index,
	) as string | ResourceLocatorValue;

	const projectGroupId = extractResourceLocatorValue(projectGroupIdValue);

	if (!projectGroupId) {
		throw new Error("Project Group ID is required for update operation.");
	}

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
