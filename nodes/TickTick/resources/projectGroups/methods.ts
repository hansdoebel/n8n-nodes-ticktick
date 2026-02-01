import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import {
	getProjectGroups,
	searchProjectGroupsForCreate,
} from "@ticktick/helpers";

export const projectGroupMethods = {
	loadOptions: {
		async getProjectGroups(this: ILoadOptionsFunctions) {
			return await getProjectGroups.call(this);
		},
	},
	listSearch: {
		async searchProjectGroupsForCreate(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjectGroupsForCreate.call(this, filter);
			return { results };
		},
	},
};
