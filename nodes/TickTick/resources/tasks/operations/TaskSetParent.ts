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
				operation: ["setParent"],
			},
		},
	},
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
		description:
			"The parent task. Leave empty to remove from parent (make top-level).",
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

export async function taskSetParentExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };
	const projectIdValue = this.getNodeParameter("projectId", index) as
		| string
		| { mode: string; value: string };
	const parentIdValue = this.getNodeParameter("parentId", index, "") as
		| string
		| { mode: string; value: string };

	let taskId: string;
	let projectId: string;
	let parentId: string;

	// Handle resource locator format for taskId
	if (typeof taskIdValue === "object" && taskIdValue !== null) {
		taskId = taskIdValue.value || "";
	} else {
		taskId = taskIdValue || "";
	}

	if (typeof projectIdValue === "object" && projectIdValue !== null) {
		projectId = projectIdValue.value || "";
	} else {
		projectId = projectIdValue || "";
	}

	if (typeof parentIdValue === "object" && parentIdValue !== null) {
		parentId = parentIdValue.value || "";
	} else {
		parentId = parentIdValue || "";
	}

	if (!taskId || taskId.trim() === "") {
		throw new Error("Task ID is required");
	}

	if (!projectId || projectId.trim() === "") {
		throw new Error("Project ID is required");
	}

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

	const taskUpdate: IDataObject = {
		...currentTask,
	};

	if (parentId && parentId !== "") {
		taskUpdate.parentId = parentId;
	} else {
		taskUpdate.parentId = "";
	}

	const body = {
		update: [taskUpdate],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.TASKS_BATCH,
		body,
	);

	return [
		{
			json: {
				success: true,
				taskId,
				projectId,
				parentId: parentId || null,
				...response,
			},
		},
	];
}
