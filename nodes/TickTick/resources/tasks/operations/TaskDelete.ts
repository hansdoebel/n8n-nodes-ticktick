import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "../../../GenericFunctions";

export const taskDeleteFields: INodeProperties[] = [
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: { show: { resource: ["task"], operation: ["delete"] } },
	},
	{
		displayName: "Task Name or ID",
		name: "taskId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		required: true,
		typeOptions: {
			loadOptionsMethod: "getTasks",
			loadOptionsDependsOn: ["projectId"],
		},
		default: "",
		displayOptions: { show: { resource: ["task"], operation: ["delete"] } },
	},
];

export async function taskDeleteExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectId = this.getNodeParameter(
		"projectId",
		index,
		"inbox",
	) as string;
	const taskId = this.getNodeParameter("taskId", index) as string;

	const endpoint = `/open/v1/project/${projectId || "inbox"}/task/${taskId}`;
	await tickTickApiRequest.call(this, "DELETE", endpoint);
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
