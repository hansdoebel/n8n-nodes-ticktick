import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const userGetStatusFields: INodeProperties[] = [];

export async function userGetStatusExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await tickTickApiRequestV2.call(this, "GET", "/user/status");

	return [{ json: response }];
}
