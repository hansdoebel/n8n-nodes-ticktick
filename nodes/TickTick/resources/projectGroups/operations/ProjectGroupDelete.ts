import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const projectGroupDeleteFields: INodeProperties[] = [
	{
		displayName: 'Project Group Name or ID',
		name: "projectGroupId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getProjectGroups",
		},
		required: true,
		default: "",
		description: 'The project group to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ["projectGroup"],
				operation: ["delete"],
			},
		},
	},
];

export async function projectGroupDeleteExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const projectGroupId = this.getNodeParameter(
		"projectGroupId",
		index,
	) as string;

	const body = {
		delete: [projectGroupId],
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"POST",
		"/batch/projectGroup",
		body,
	);

	return [
		{
			json: {
				success: true,
				deletedProjectGroupId: projectGroupId,
				...response,
			},
		},
	];
}
