import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	formatTickTickDate,
	tickTickApiRequest,
} from "@ticktick/GenericFunctions";

export const taskCreateFields: INodeProperties[] = [
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["task"], operation: ["create"] } },
	},
	{
		displayName: "Title",
		name: "title",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["create"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: 'Project Name or ID',
		name: "projectId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["create"],
				jsonParameters: [false],
			},
		},
	},
];

export async function taskCreateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body;

	if (useJson) {
		body = JSON.parse(
			this.getNodeParameter("additionalFieldsJson", index, "{}") as string,
		);
	} else {
		const title = this.getNodeParameter("title", index) as string;
		const projectId = this.getNodeParameter("projectId", index) as string;
		const dueDate = this.getNodeParameter("dueDate", index, "") as string;

		body = { title, projectId, dueDate: formatTickTickDate(dueDate) };
	}

	const response = await tickTickApiRequest.call(
		this,
		"POST",
		"/open/v1/task",
		body,
	);
	return [{ json: response }];
}
