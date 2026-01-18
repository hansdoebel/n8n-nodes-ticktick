import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const taskAssignFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
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
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["assign"],
				authentication: ["tickTickSessionApi"],
			},
		},
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to assign",
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
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["assign"],
				authentication: ["tickTickSessionApi"],
			},
		},
	},
	{
		displayName: "Assignee User ID",
		name: "assignee",
		type: "string",
		default: "",
		required: true,
		description:
			"The user ID to assign the task to (obtain from Get Project Users)",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["assign"],
				authentication: ["tickTickSessionApi"],
			},
		},
	},
];

export async function taskAssignExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectIdValue = this.getNodeParameter("projectId", index) as
		| string
		| { mode: string; value: string };
	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };
	const assignee = this.getNodeParameter("assignee", index) as string;

	const projectId = typeof projectIdValue === "object"
		? projectIdValue.value
		: projectIdValue;
	const taskId = typeof taskIdValue === "object"
		? taskIdValue.value
		: taskIdValue;

	if (!projectId?.trim()) {
		throw new Error("Project ID is required");
	}
	if (!taskId?.trim()) {
		throw new Error("Task ID is required");
	}
	if (!assignee?.trim()) {
		throw new Error("Assignee is required");
	}

	const body = [{ assignee, projectId, taskId }] as unknown as IDataObject;

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.TASK_ASSIGN,
		body,
	);

	return [{ json: response }];
}
