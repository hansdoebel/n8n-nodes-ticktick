import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	isV2Auth,
	tickTickApiRequest,
	tickTickApiRequestV2,
} from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectDeleteFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The project to delete",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjects",
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
							errorMessage: "Project ID must contain only letters and numbers",
						},
					},
				],
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
		displayOptions: { show: { resource: ["project"], operation: ["delete"] } },
	},
];

export async function projectDeleteExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectIdValue = this.getNodeParameter("projectId", index, "") as
		| string
		| { mode: string; value: string };

	let projectId: string;

	if (typeof projectIdValue === "object" && projectIdValue !== null) {
		projectId = projectIdValue.value || "";
	} else {
		projectId = projectIdValue || "";
	}

	if (!projectId) {
		throw new Error("Project ID is required for delete operation.");
	}

	const useV2 = isV2Auth(this, index);

	if (useV2) {
		const body = {
			delete: [projectId],
		};
		await tickTickApiRequestV2.call(
			this,
			"POST",
			ENDPOINTS.PROJECTS_BATCH,
			body,
		);
	} else {
		await tickTickApiRequest.call(
			this,
			"DELETE",
			ENDPOINTS.OPEN_V1_PROJECT_BY_ID(projectId),
		);
	}

	return [
		{
			json: {
				success: true,
				operation: "delete",
				projectId,
			},
		},
	];
}
