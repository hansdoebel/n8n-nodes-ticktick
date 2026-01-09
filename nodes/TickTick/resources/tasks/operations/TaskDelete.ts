import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/helpers";
import { isV2Auth, tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const taskDeleteFields: INodeProperties[] = [
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
		displayOptions: { show: { resource: ["task"], operation: ["delete"] } },
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to delete",
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
		displayOptions: { show: { resource: ["task"], operation: ["delete"] } },
	},
];

export async function taskDeleteExecute(
	this: IExecuteFunctions,
	index: number,
) {
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
		const syncResponse = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const tasks = ((syncResponse.syncTaskBean as IDataObject)?.update ||
			[]) as IDataObject[];
		const task = tasks.find((t) => String(t.id) === taskId);

		if (!task) {
			throw new Error(`Task with ID ${taskId} not found`);
		}

		const taskProjectId = task.projectId as string;
		const body = {
			add: [],
			update: [],
			delete: [
				{
					projectId: taskProjectId,
					taskId: taskId,
				},
			],
			addAttachments: [],
			updateAttachments: [],
			deleteAttachments: [],
		};
		await tickTickApiRequestV2.call(this, "POST", ENDPOINTS.TASKS_BATCH, body);
	} else {
		const endpoint = `/open/v1/project/${projectId || "inbox"}/task/${taskId}`;
		await tickTickApiRequest.call(this, "DELETE", endpoint);
	}

	return [
		{
			json: {
				success: true,
				operation: "delete",
				taskId,
				projectId,
			},
		},
	];
}
