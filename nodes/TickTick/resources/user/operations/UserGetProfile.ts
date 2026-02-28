import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";

export const userGetProfileFields: INodeProperties[] = [];

export async function userGetProfileExecute(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[]> {
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.USER_PROFILE,
	);

	return [{ json: response }];
}
