import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const projectGetFields: INodeProperties[] = [
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: { show: { resource: ["project"], operation: ["get"] } },
	},
	{
		displayName: "Include Project Data",
		name: "projectData",
		type: "boolean",
		default: false,
		displayOptions: {
			show: { resource: ["project"], operation: ["get"] },
			hide: { projectId: ["inbox"] },
		},
	},
];

export async function projectGetExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectId = this.getNodeParameter("projectId", index, "") as string;
	const projectData = this.getNodeParameter(
		"projectData",
		index,
		false,
	) as boolean;

	let endpoint = "/open/v1/project";
	if (projectId === "inbox") {
		endpoint = "/open/v1/project/inbox/data";
	} else if (projectId) {
		endpoint = `/open/v1/project/${projectId}`;
		if (projectData) endpoint += "/data";
	}

	const response = await tickTickApiRequest.call(this, "GET", endpoint);
	return [{ json: response }];
}
