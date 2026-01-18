import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import {
	getTasks,
	searchProjectUsers,
	searchSharedProjects,
} from "@ticktick/helpers";

export const taskMethods = {
	loadOptions: {
		async getTasks(this: ILoadOptionsFunctions) {
			const projectId = this.getCurrentNodeParameter("projectId") as string;
			return await getTasks.call(this, projectId);
		},
	},
	listSearch: {
		async searchProjectUsers(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjectUsers.call(this, filter);
			return { results };
		},
		async searchSharedProjects(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchSharedProjects.call(this, filter);
			return { results };
		},
	},
};
