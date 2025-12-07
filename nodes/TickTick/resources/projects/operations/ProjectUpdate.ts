import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const projectUpdateFields: INodeProperties[] = [
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["project"], operation: ["update"] } },
	},
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		required: true,
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
	},
];

export async function projectUpdateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	const projectId = this.getNodeParameter("projectId", index, "") as string;
	let body: Record<string, any> = {};

	if (useJson) {
		body = JSON.parse(
			this.getNodeParameter("additionalFieldsJson", index, "{}") as string,
		);
	} else {
		const name = this.getNodeParameter("name", index, "") as string;
		const viewMode = this.getNodeParameter("viewMode", index, "list") as string;
		const kind = this.getNodeParameter("kind", index, "task") as string;
		const color = this.getNodeParameter("color", index, "") as string;
		body = { name, viewMode, kind, color };
	}

	if (!projectId) {
		throw new Error("Project ID is required for update operation.");
	}

	const endpoint = `/open/v1/project/${projectId}`;
	const response = await tickTickApiRequest.call(this, "POST", endpoint, body);
	return [{ json: response }];
}
