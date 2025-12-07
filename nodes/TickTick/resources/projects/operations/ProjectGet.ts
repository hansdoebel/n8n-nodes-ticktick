import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const projectGetFields: INodeProperties[] = [
	{
		displayName: "Mode",
		name: "mode",
		type: "options",
		options: [
			{
				name: "Get Many",
				value: "getAll",
				description: "Retrieve a list of all projects",
			},
			{
				name: "Get Specific Project",
				value: "getSpecific",
				description: "Retrieve details of a single project",
			},
			{
				name: "Get Project With Data",
				value: "getWithData",
				description: "Retrieve a project along with its tasks and columns",
			},
		],
		default: "getSpecific",
		displayOptions: {
			show: { resource: ["project"], operation: ["get"] },
		},
	},
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["get"],
				mode: ["getSpecific", "getWithData"],
			},
		},
	},
];

export async function projectGetExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const mode = this.getNodeParameter("mode", index) as string;
	let endpoint = "/open/v1/project";

	if (mode === "getAll") {
		endpoint = "/open/v1/project";
	} else {
		let projectId = this.getNodeParameter("projectId", index, "") as string;

		if (!projectId) {
			projectId = "inbox";
		}

		if (mode === "getWithData") {
			endpoint = `/open/v1/project/${projectId}/data`;
		} else {
			if (projectId === "inbox") {
				throw new Error(
					"The 'Get Specific Project' mode does not support the Inbox. Please use 'Get Project With Data' to see Inbox tasks, or select a custom project.",
				);
			}
			endpoint = `/open/v1/project/${projectId}`;
		}
	}

	const response = await tickTickApiRequest.call(this, "GET", endpoint);
	return [{ json: response }];
}
