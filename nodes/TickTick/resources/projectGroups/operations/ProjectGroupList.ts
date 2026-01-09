import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectGroupListFields: INodeProperties[] = [];

export async function projectGroupListExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.SYNC,
	);

	const projectGroups = response.projectGroups || [];

	return projectGroups.map((group: Record<string, unknown>) => ({
		json: group,
	}));
}
