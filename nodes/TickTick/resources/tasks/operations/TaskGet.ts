import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "../../../GenericFunctions";

export const taskGetFields: INodeProperties[] = [
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: { show: { resource: ["task"], operation: ["get"] } },
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
		displayOptions: { show: { resource: ["task"], operation: ["get"] } },
	},
];

export async function taskGetExecute(this: IExecuteFunctions, index: number) {
	const projectId = this.getNodeParameter(
		"projectId",
		index,
		"inbox",
	) as string;
	const taskId = this.getNodeParameter("taskId", index) as string;

	const endpoint = `/open/v1/project/${projectId || "inbox"}/task/${taskId}`;
	const response = await tickTickApiRequest.call(this, "GET", endpoint);
	return [{ json: response }];
}
