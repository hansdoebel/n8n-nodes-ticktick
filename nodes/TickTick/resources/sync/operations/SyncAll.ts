import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const syncAllFields: INodeProperties[] = [];

export async function syncAllExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/batch/check/0",
	);

	return [{ json: response }];
}
