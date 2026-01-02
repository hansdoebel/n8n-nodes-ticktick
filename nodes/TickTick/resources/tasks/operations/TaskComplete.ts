import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const taskCompleteFields: INodeProperties[] = [
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: { show: { resource: ["task"], operation: ["complete"] } },
	},
	{
		displayName: "Task Name or ID",
		name: "taskId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: "getTasks",
			loadOptionsDependsOn: ["projectId"],
		},
		default: "",
		displayOptions: { show: { resource: ["task"], operation: ["complete"] } },
	},
];

export async function taskCompleteExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectId = this.getNodeParameter(
		"projectId",
		index,
		"inbox",
	) as string;
	const taskId = this.getNodeParameter("taskId", index) as string;

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
