import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const tagListFields: INodeProperties[] = [];

export async function tagListExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.SYNC,
	);

	const tags = response.tags || [];

	return tags.map((tag: Record<string, unknown>) => ({ json: tag }));
}
