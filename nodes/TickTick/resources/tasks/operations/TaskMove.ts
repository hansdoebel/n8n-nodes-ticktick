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
		displayName: "From Project",
		name: "fromProjectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The current project containing the task",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjects",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["move"],
			},
		},
	},
	{
		displayName: "To Project",
		name: "toProjectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The destination project for the task",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjects",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
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
	const fromProjectIdValue = this.getNodeParameter("fromProjectId", index) as
		| string
		| { mode: string; value: string };
	const toProjectIdValue = this.getNodeParameter("toProjectId", index) as
		| string
		| { mode: string; value: string };

	let fromProjectId: string;
	let toProjectId: string;

	if (typeof fromProjectIdValue === "object" && fromProjectIdValue !== null) {
		fromProjectId = fromProjectIdValue.value || "";
	} else {
		fromProjectId = fromProjectIdValue || "";
	}

	if (typeof toProjectIdValue === "object" && toProjectIdValue !== null) {
		toProjectId = toProjectIdValue.value || "";
	} else {
		toProjectId = toProjectIdValue || "";
	}

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
