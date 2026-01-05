import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const taskMoveFields: INodeProperties[] = [
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to move",
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
				operation: ["move"],
			},
		},
	},
	{
		displayName: "To Project",
		name: "toProjectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The destination project for the task",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjectsForMove",
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
				operation: ["move"],
			},
		},
	},
];

export async function taskMoveExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };
	const toProjectIdValue = this.getNodeParameter("toProjectId", index) as
		| string
		| { mode: string; value: string };

	let taskId: string;
	let toProjectId: string;

	if (typeof taskIdValue === "object" && taskIdValue !== null) {
		taskId = taskIdValue.value || "";
	} else {
		taskId = taskIdValue || "";
	}

	if (typeof toProjectIdValue === "object" && toProjectIdValue !== null) {
		toProjectId = toProjectIdValue.value || "";
	} else {
		toProjectId = toProjectIdValue || "";
	}

	// Fetch the task details from sync endpoint to get current projectId
	const syncResponse = (await tickTickApiRequestV2.call(
		this,
		"GET",
		"/batch/check/0",
	)) as IDataObject;

	const tasks =
		((syncResponse.syncTaskBean as IDataObject)?.update || []) as IDataObject[];
	const task = tasks.find((t) => String(t.id) === taskId);

	if (!task) {
		throw new Error(`Task with ID ${taskId} not found`);
	}

	const fromProjectId = task.projectId as string;

	// Use batch/task endpoint to update the task's project
	const body = {
		update: [
			{
				...task,
				projectId: toProjectId,
			},
		],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/batch/task",
		body,
	);

	return [
		{
			json: {
				success: true,
				taskId,
				fromProjectId,
				toProjectId,
				...response,
			},
		},
	];
}
