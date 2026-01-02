import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const taskMoveFields: INodeProperties[] = [
	{
		displayName: "Task ID",
		name: "taskId",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. 6123abc456def789",
		description: "The ID of the task to move",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["move"],
			},
		},
	},
	{
		displayName: "From Project Name or ID",
		name: "fromProjectId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getProjects",
		},
		required: true,
		default: "",
		description: 'The current project containing the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["move"],
			},
		},
	},
	{
		displayName: "To Project Name or ID",
		name: "toProjectId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getProjects",
		},
		required: true,
		default: "",
		description: 'The destination project for the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["move"],
			},
		},
	},
];

export async function taskMoveExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskId = this.getNodeParameter("taskId", index) as string;
	const fromProjectId = this.getNodeParameter("fromProjectId", index) as string;
	const toProjectId = this.getNodeParameter("toProjectId", index) as string;

	const body = {
		taskId,
		toProjectId,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		`/project/${fromProjectId}/task/${taskId}/move`,
		body,
	);

	return [
		{
			json: {
				success: true,
				taskId,
				fromProjectId,
				toProjectId,
				...response,
			},
		},
	];
}
