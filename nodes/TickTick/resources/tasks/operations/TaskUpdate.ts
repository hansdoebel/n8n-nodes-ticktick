import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	formatTickTickDate,
	tickTickApiRequest,
} from "@ticktick/GenericFunctions";

export const taskUpdateFields: INodeProperties[] = [
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["task"], operation: ["update"] } },
	},
	{
		displayName: "Task Name or ID",
		name: "taskId",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
	},
];

export async function taskUpdateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const taskId = this.getNodeParameter("taskId", index) as string;
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
		const title = this.getNodeParameter("title", index, "") as string;
		const dueDate = this.getNodeParameter("dueDate", index, "") as string;
		body = { title, dueDate: formatTickTickDate(dueDate) };
	}

	const endpoint = `/open/v1/task/${taskId}`;
	const response = await tickTickApiRequest.call(this, "POST", endpoint, body);
	return [{ json: response }];
}
