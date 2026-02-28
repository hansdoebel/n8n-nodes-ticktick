import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";

export const projectGroupListFields: INodeProperties[] = [];

export async function projectGroupListExecute(
	this: IExecuteFunctions,
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
