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
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getProjects",
		},
		required: true,
		default: "",
		description:
			'The project containing the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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
	const projectId = this.getNodeParameter("projectId", index) as string;
	const parentId = this.getNodeParameter("parentId", index, "") as string;

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
