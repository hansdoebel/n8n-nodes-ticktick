import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const projectGroupListFields: INodeProperties[] = [];

export async function projectGroupListExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	// V2 API returns project groups via sync endpoint
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/batch/check/0",
	);

	const projectGroups = response.projectGroups || [];

	return projectGroups.map((group: Record<string, unknown>) => ({
		json: group,
	}));
}
