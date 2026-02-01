import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const taskSetParentFields: INodeProperties[] = [
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to make a subtask",
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
				operation: ["setParent"],
			},
		},
	},
	{
		displayName: "Parent Task",
		name: "parentId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The parent task. Both tasks must be in the same project.",
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
				operation: ["setParent"],
			},
		},
	},
];

function extractValue(
	value: string | { mode: string; value: string } | undefined,
): string {
	if (typeof value === "object" && value !== null) {
		return value.value || "";
	}
	return value || "";
}

export async function taskSetParentExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskId = extractValue(
		this.getNodeParameter("taskId", index) as
			| string
			| { mode: string; value: string },
	);
	const parentId = extractValue(
		this.getNodeParameter("parentId", index) as
			| string
			| { mode: string; value: string },
	);

	if (!taskId || taskId.trim() === "") {
		throw new Error("Task ID is required");
	}

	if (!parentId || parentId.trim() === "") {
		throw new Error("Parent Task ID is required");
	}

	// Fetch all tasks to find the task and parent
	const syncResponse = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.SYNC,
	);

	const tasks = ((syncResponse.syncTaskBean as IDataObject)?.update ||
		[]) as IDataObject[];

	const currentTask = tasks.find((t) => String(t.id) === taskId);
	if (!currentTask) {
		throw new Error(`Task with ID ${taskId} not found`);
	}

	const parentTask = tasks.find((t) => String(t.id) === parentId);
	if (!parentTask) {
		throw new Error(`Parent task with ID ${parentId} not found`);
	}

	// Verify both tasks are in the same project
	const taskProjectId = currentTask.projectId as string;
	const parentProjectId = parentTask.projectId as string;

	if (taskProjectId !== parentProjectId) {
		throw new Error(
			`Task and parent must be in the same project. Task is in project "${taskProjectId}", parent is in project "${parentProjectId}".`,
		);
	}

	// Use the batch/taskParent endpoint with the correct payload format
	const payload = [
		{
			taskId: taskId,
			parentId: parentId,
			projectId: taskProjectId,
		},
	];

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.TASK_PARENT,
		payload as unknown as IDataObject,
	);

	return [{ json: response }];
}
