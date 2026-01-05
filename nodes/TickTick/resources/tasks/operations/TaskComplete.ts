import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const taskCompleteFields: INodeProperties[] = [
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
		displayOptions: { show: { resource: ["task"], operation: ["complete"] } },
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to complete",
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
		displayOptions: { show: { resource: ["task"], operation: ["complete"] } },
	},
];

export async function taskCompleteExecute(
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

	const endpoint = `/open/v1/project/${
		projectId || "inbox"
	}/task/${taskId}/complete`;
	await tickTickApiRequest.call(this, "POST", endpoint);
	return [
		{
			json: {
				success: true,
				operation: "complete",
				taskId,
				projectId,
			},
		},
	];
}
