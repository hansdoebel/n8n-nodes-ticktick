import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const taskSetParentFields: INodeProperties[] = [
	{
		displayName: "Task ID",
		name: "taskId",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. 6123abc456def789",
		description: "The ID of the task to make a subtask",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["setParent"],
			},
		},
	},
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
		displayName: "Parent Task ID",
		name: "parentId",
		type: "string",
		default: "",
		description:
			"The ID of the parent task. Leave empty to remove from parent (make top-level).",
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
	const taskId = this.getNodeParameter("taskId", index) as string;
	const projectIdValue = this.getNodeParameter("projectId", index) as
		| string
		| { mode: string; value: string };
	const parentId = this.getNodeParameter("parentId", index, "") as string;

	let projectId: string;

	if (typeof projectIdValue === "object" && projectIdValue !== null) {
		projectId = projectIdValue.value || "";
	} else {
		projectId = projectIdValue || "";
	}

	// First get the current task data
	const currentTask = await tickTickApiRequestV2.call(
		this,
		"GET",
		`/project/${projectId}/task/${taskId}`,
	);

	const body = {
		update: [
			{
				...currentTask,
				id: taskId,
				projectId,
				parentId: parentId || null,
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
				projectId,
				parentId: parentId || null,
				...response,
			},
		},
	];
}
