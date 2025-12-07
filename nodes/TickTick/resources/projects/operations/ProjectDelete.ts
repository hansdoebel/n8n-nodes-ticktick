import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const projectDeleteFields: INodeProperties[] = [
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		required: true,
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: { show: { resource: ["project"], operation: ["delete"] } },
	},
];

export async function projectDeleteExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectId = this.getNodeParameter("projectId", index, "") as string;
	const endpoint = `/open/v1/project/${projectId}`;
	await tickTickApiRequest.call(this, "DELETE", endpoint);

	return [
		{
			json: {
				success: true,
				operation: "delete",
				projectId,
			},
		},
	];
}
