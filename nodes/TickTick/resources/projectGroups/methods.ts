import type { ILoadOptionsFunctions } from "n8n-workflow";
import { getProjectGroups } from "@ticktick/GenericFunctions";

export const projectGroupMethods = {
	loadOptions: {
		async getProjectGroups(this: ILoadOptionsFunctions) {
			return await getProjectGroups.call(this);
		},
	},
};
