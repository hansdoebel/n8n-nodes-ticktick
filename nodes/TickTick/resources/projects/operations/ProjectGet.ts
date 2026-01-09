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
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectGetFields: INodeProperties[] = [
	{
		displayName: "Mode",
		name: "mode",
		type: "options",
		options: [
			{
				name: "Get Many",
				value: "getAll",
				description: "Retrieve a list of all projects",
			},
			{
				name: "Get Specific Project",
				value: "getSpecific",
				description: "Retrieve details of a single project",
			},
			{
				name: "Get Project With Data",
				value: "getWithData",
				description: "Retrieve a project along with its tasks and columns",
			},
		],
		default: "getSpecific",
		displayOptions: {
			show: { resource: ["project"], operation: ["get"] },
		},
	},
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		description: "The project to retrieve",
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
							regex: "^[a-zA-Z0-9]+$|^$",
							errorMessage:
								"Project ID must contain only letters and numbers, or be empty for Inbox",
						},
					},
				],
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["get"],
				mode: ["getSpecific", "getWithData"],
			},
		},
	},
];

export async function projectGetExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const mode = this.getNodeParameter("mode", index) as string;
	const useV2 = isV2Auth(this, index);

	if (useV2) {
		return projectGetExecuteV2.call(this, index, mode);
	}

	let endpoint: string = ENDPOINTS.OPEN_V1_PROJECT;

	if (mode === "getAll") {
		endpoint = ENDPOINTS.OPEN_V1_PROJECT;
	} else {
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
			projectId = "inbox";
		}

		if (mode === "getWithData") {
			endpoint = `${ENDPOINTS.OPEN_V1_PROJECT}/${projectId}/data`;
		} else {
			if (projectId === "inbox") {
				throw new Error(
					"The 'Get Specific Project' mode does not support the Inbox. Please use 'Get Project With Data' to see Inbox tasks, or select a custom project.",
				);
			}
			endpoint = `${ENDPOINTS.OPEN_V1_PROJECT}/${projectId}`;
		}
	}

	const response = await tickTickApiRequest.call(this, "GET", endpoint);
	return [{ json: response }];
}

async function projectGetExecuteV2(
	this: IExecuteFunctions,
	index: number,
	mode: string,
) {
	const response = (await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.SYNC,
	)) as IDataObject;

	if (mode === "getAll") {
		const projects = (response.projectProfiles as IDataObject[]) || [];
		return [{ json: projects }];
	}

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
		projectId = "inbox";
	}

	const projects = (response.projectProfiles as IDataObject[]) || [];
	const tasks =
		((response.syncTaskBean as IDataObject)?.update as IDataObject[]) || [];

	const project = projects.find((p) => String(p.id) === projectId);

	if (mode === "getWithData") {
		const projectTasks = tasks.filter(
			(task) => String(task.projectId) === projectId,
		);

		return [
			{
				json: {
					project: project || { id: projectId },
					tasks: projectTasks,
					columns: [],
				},
			},
		];
	}

	if (projectId === "inbox") {
		throw new Error(
			"The 'Get Specific Project' mode does not support the Inbox. Please use 'Get Project With Data' to see Inbox tasks, or select a custom project.",
		);
	}

	if (!project) {
		throw new Error(`Project with ID ${projectId} not found`);
	}

	return [{ json: project }];
}
