import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import {
	isV2Auth,
	tickTickApiRequest,
	tickTickApiRequestV2,
} from "@helpers/apiRequest";
import { extractResourceLocatorValue, setIfDefined } from "@ticktick/helpers";
import { ENDPOINTS } from "@ticktick/constants/endpoints";
import type { ProjectBody, ResourceLocatorValue } from "@ticktick/types/api";

export const projectUpdateFields: INodeProperties[] = [
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["project"], operation: ["update"] } },
	},
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The project to update",
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
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "Additional Fields (JSON)",
		name: "additionalFieldsJson",
		type: "json",
		typeOptions: { alwaysOpenEditWindow: true },
		default: "",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["update"],
				jsonParameters: [true],
			},
		},
		description: "Raw JSON body to send directly to TickTick",
	},
	{
		displayName: "Update Fields",
		name: "updateFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: "#F18181",
				description: "Color of the project in Hex format",
			},
			{
				displayName: "Kind",
				name: "kind",
				type: "options",
				options: [
					{ name: "Note", value: "NOTE" },
					{ name: "Task", value: "TASK" },
				],
				default: "TASK",
				description: "Kind of project",
			},
			{
				displayName: "Name",
				name: "name",
				type: "string",
				default: "",
				description: "Name of the project",
			},
			{
				displayName: "Project Group",
				name: "groupId",
				type: "resourceLocator",
				default: { mode: "list", value: "" },
				description:
					'Project group to place this project in. Select "None" to remove from current group. Requires V2 API (Email/Password authentication).',
				modes: [
					{
						displayName: "From List",
						name: "list",
						type: "list",
						typeOptions: {
							searchListMethod: "searchProjectGroupsForUpdate",
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
			},
			{
				displayName: "Sort Order",
				name: "sortOrder",
				type: "number",
				default: 0,
				description: "Sort order value of the project",
			},
			{
				displayName: "View Mode",
				name: "viewMode",
				type: "options",
				options: [
					{ name: "Kanban", value: "kanban" },
					{ name: "List", value: "list" },
					{ name: "Timeline", value: "timeline" },
				],
				default: "list",
				description: "Default view mode for the project",
			},
		],
	},
];

interface ProjectUpdateFields {
	color?: string;
	groupId?: string | ResourceLocatorValue;
	kind?: string;
	name?: string;
	sortOrder?: number;
	viewMode?: string;
}

export async function projectUpdateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;

	const projectIdValue = this.getNodeParameter("projectId", index, "") as
		| string
		| ResourceLocatorValue;

	const projectId = extractResourceLocatorValue(projectIdValue);

	let body: ProjectBody = {};

	if (useJson) {
		const jsonString = this.getNodeParameter(
			"additionalFieldsJson",
			index,
			"{}",
		) as string;
		try {
			body = JSON.parse(jsonString) as ProjectBody;
		} catch (error) {
			throw new Error(`Invalid JSON provided: ${(error as Error).message}`);
		}
	} else {
		const updateFields = this.getNodeParameter(
			"updateFields",
			index,
			{},
		) as ProjectUpdateFields;

		const cleaned: ProjectBody = {};

		setIfDefined(cleaned, "color", updateFields.color);
		setIfDefined(cleaned, "kind", updateFields.kind);
		setIfDefined(cleaned, "name", updateFields.name);
		setIfDefined(cleaned, "sortOrder", updateFields.sortOrder);
		setIfDefined(cleaned, "viewMode", updateFields.viewMode);

		if (updateFields.groupId !== undefined) {
			const groupIdValue = extractResourceLocatorValue(updateFields.groupId);
			if (groupIdValue === "null") {
				cleaned.groupId = "null";
			} else if (groupIdValue) {
				cleaned.groupId = groupIdValue;
			}
		}

		body = cleaned;
	}

	if (!projectId) {
		throw new Error("Project ID is required for update operation.");
	}

	const useV2 = isV2Auth(this, index);

	if (useV2) {
		const syncResponse = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const projects = (syncResponse.projectProfiles as IDataObject[]) || [];
		const currentProject = projects.find((p) => String(p.id) === projectId);

		if (!currentProject) {
			throw new Error(`Project with ID ${projectId} not found`);
		}

		const batchBody = {
			update: [
				{
					...currentProject,
					...body,
				},
			],
		};
		const response = await tickTickApiRequestV2.call(
			this,
			"POST",
			ENDPOINTS.PROJECTS_BATCH,
			batchBody,
		);
		return [{ json: response }];
	}

	const response = await tickTickApiRequest.call(
		this,
		"POST",
		ENDPOINTS.OPEN_V1_PROJECT_BY_ID(projectId),
		body,
	);
	return [{ json: response }];
}
