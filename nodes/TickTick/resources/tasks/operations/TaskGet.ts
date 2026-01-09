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

export const taskGetFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		description: "The project containing the task",
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
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
		displayOptions: { show: { resource: ["task"], operation: ["get"] } },
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to retrieve",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchTasks",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 6123abc456def789",
			},
		],
		displayOptions: { show: { resource: ["task"], operation: ["get"] } },
	},
];

export async function taskGetExecute(this: IExecuteFunctions, index: number) {
	const projectIdValue = this.getNodeParameter("projectId", index, "") as
		| string
		| { mode: string; value: string };
	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };

	let projectId: string;
	let taskId: string;

	if (typeof projectIdValue === "object" && projectIdValue !== null) {
		projectId = projectIdValue.value || "";
	} else {
		projectId = projectIdValue || "";
	}

	if (typeof taskIdValue === "object" && taskIdValue !== null) {
		taskId = taskIdValue.value || "";
	} else {
		taskId = taskIdValue || "";
	}

	const useV2 = isV2Auth(this, index);

	if (useV2) {
		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const tasks =
			((response.syncTaskBean as IDataObject)?.update || []) as IDataObject[];
		const task = tasks.find((t) => String(t.id) === taskId);

		if (!task) {
			throw new Error(`Task with ID ${taskId} not found`);
		}

		return [{ json: task }];
	}

	const endpoint = `/open/v1/project/${projectId || "inbox"}/task/${taskId}`;
	const response = await tickTickApiRequest.call(this, "GET", endpoint);
	return [{ json: response }];
}
