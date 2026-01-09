import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const userGetPreferencesFields: INodeProperties[] = [];

export async function userGetPreferencesExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.USER_PREFERENCES_SETTINGS,
		{},
		{ includeWeb: "true" },
	);

	return [{ json: response }];
}
