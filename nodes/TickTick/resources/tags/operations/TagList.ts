import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagListFields: INodeProperties[] = [];

export async function tagListExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	// V2 API returns tags via sync endpoint
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/batch/check/0",
	);

	const tags = response.tags || [];

	return tags.map((tag: Record<string, unknown>) => ({ json: tag }));
}
