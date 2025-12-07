import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "../../../GenericFunctions";

export const projectCreateFields: INodeProperties[] = [
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["project"], operation: ["create"] } },
	},
	{
		displayName: "Project Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["create"],
				jsonParameters: [false],
			},
		},
	},
];

export async function projectCreateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body: Record<string, any> = {};

	if (useJson) {
		body = JSON.parse(
			this.getNodeParameter("additionalFieldsJson", index, "{}") as string,
		);
	} else {
		const name = this.getNodeParameter("name", index) as string;
		const viewMode = this.getNodeParameter("viewMode", index, "list") as string;
		const kind = this.getNodeParameter("kind", index, "task") as string;
		const color = this.getNodeParameter("color", index, "") as string;
		body = { name, viewMode, kind, color };
	}

	const response = await tickTickApiRequest.call(
		this,
		"POST",
		"/open/v1/project",
		body,
	);
	return [{ json: response }];
}
