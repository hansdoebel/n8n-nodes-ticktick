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

	// Fetch all tasks to find the task (and parent if specified)
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

	const taskProjectId = currentTask.projectId as string;
	const isRemovingParent = !parentId || parentId.trim() === "";

	// If setting a parent (not removing), validate the parent task exists and is in same project
	if (!isRemovingParent) {
		const parentTask = tasks.find((t) => String(t.id) === parentId);
		if (!parentTask) {
			throw new Error(`Parent task with ID ${parentId} not found`);
		}

		const parentProjectId = parentTask.projectId as string;
		if (taskProjectId !== parentProjectId) {
			throw new Error(
				`Task and parent must be in the same project. Task is in project "${taskProjectId}", parent is in project "${parentProjectId}".`,
			);
		}
	}

	// Use the batch endpoint to update the task's parentId
	const updatedTask = {
		...currentTask,
		id: taskId,
		projectId: taskProjectId,
		parentId: isRemovingParent ? "" : parentId,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.TASKS_BATCH,
		{ update: [updatedTask] } as unknown as IDataObject,
	);

	return [{
		json: {
			success: true,
			taskId: taskId,
			parentId: isRemovingParent ? null : parentId,
			response,
		},
	}];
}
